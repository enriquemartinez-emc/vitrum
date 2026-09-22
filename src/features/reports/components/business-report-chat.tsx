"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ChartColumnIcon } from "lucide-react"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Spinner } from "@/components/ui/spinner"

export function BusinessReportChat() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/reports/chat" }),
  })

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim()
    if (!text) return

    sendMessage({ text })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<ChartColumnIcon className="size-8" />}
              title="Ask about your business"
              description="Revenue, order status, glass demand, quote conversion, top customers…"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={`${message.id}-${index}`}>
                          {part.text}
                        </MessageResponse>
                      )
                    }
                    return null
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Spinner className="size-4" />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder="How much revenue did we book last month?" />
        </PromptInputBody>
        <PromptInputFooter>
          <span className="text-xs text-muted-foreground">
            Read-only — answering a question never changes your data.
          </span>
          <PromptInputSubmit status={status} disabled={status !== "ready"} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
