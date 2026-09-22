"use client"

import { useRef, useState } from "react"
import type { ChatStatus } from "ai"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { extractQuoteDraftAction, type QuoteDraft } from "@/features/quotes/ai/actions"

type AiQuoteAssistantDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDraftReady: (draft: QuoteDraft) => void
}

export function AiQuoteAssistantDialog(props: AiQuoteAssistantDialogProps) {
  const { open, onOpenChange } = props

  // Remount on every open, like the other dialogs/drawers in this app, so a
  // failed attempt's text and error never leak into the next time it's opened.
  const [instanceKey, setInstanceKey] = useState(0)
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    setInstanceKey((key) => key + 1)
  } else if (!open && wasOpen.current) {
    wasOpen.current = false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AiQuoteAssistantForm key={instanceKey} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function AiQuoteAssistantForm({ onOpenChange, onDraftReady }: AiQuoteAssistantDialogProps) {
  const [status, setStatus] = useState<ChatStatus>("ready")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim()
    if (!text) return

    setStatus("submitted")
    setError(null)

    try {
      const result = await extractQuoteDraftAction(text)

      if (result.status === "error") {
        setStatus("error")
        setError(result.message)
        return
      }

      setStatus("ready")
      onDraftReady(result)
      onOpenChange(false)
    } catch {
      setStatus("error")
      setError("Something went wrong. Try again.")
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Quote from a description</DialogTitle>
        <DialogDescription>
          Describe the windows in plain language — review the drafted line items before
          anything is saved.
        </DialogDescription>
      </DialogHeader>

      {/* Provider keeps the typed text under our control, so a failed submit
          (rate limit, validation) never wipes it — PromptInput's own submit
          handler only clears provider-managed text on success. */}
      <PromptInputProvider>
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="2 double-hung 24x36 low-e for Maria Gonzalez, 1 casement 30x40 tempered" />
          </PromptInputBody>
          <PromptInputFooter>
            <span className="text-xs text-muted-foreground">
              {status === "submitted" ? "Reading your request…" : "Nothing is saved yet."}
            </span>
            <PromptInputSubmit status={status} disabled={status === "submitted"} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  )
}
