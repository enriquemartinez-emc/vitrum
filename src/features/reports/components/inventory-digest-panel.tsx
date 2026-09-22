"use client"

import { useState } from "react"
import { CheckCircle2Icon, PackageXIcon, SparklesIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { narrateShortageDigestAction } from "@/features/reports/ai/actions"
import type { ShortageDigestItem } from "@/features/reports/shortage-digest"

export function InventoryDigestPanel({ items }: { items: ShortageDigestItem[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setStatus("loading")
    setError(null)

    try {
      const result = await narrateShortageDigestAction()
      if (result.status === "error") {
        setStatus("error")
        setError(result.message)
        return
      }
      setStatus("idle")
      setSummary(result.summary)
    } catch {
      setStatus("error")
      setError("Something went wrong. Try again.")
    }
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2Icon />
          </EmptyMedia>
          <EmptyTitle>Nothing to reorder</EmptyTitle>
          <EmptyDescription>
            Every pending quote can be fulfilled from current stock.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Glass type</TableHead>
              <TableHead>Short by</TableHead>
              <TableHead>Pending quotes</TableHead>
              <TableHead>Oldest waiting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.glassTypeId}>
                <TableCell className="font-medium">{item.glassTypeName}</TableCell>
                <TableCell>
                  <Badge variant="destructive">
                    <PackageXIcon data-icon="inline-start" />
                    {item.shortfallQuantity} unit{item.shortfallQuantity > 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.affectedQuoteCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.oldestPendingDays === 0
                    ? "Today"
                    : `${item.oldestPendingDays} day${item.oldestPendingDays > 1 ? "s" : ""}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {summary && (
        <Alert>
          <SparklesIcon />
          <AlertTitle>Recommendation</AlertTitle>
          <AlertDescription>{summary}</AlertDescription>
        </Alert>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        variant="outline"
        className="self-start"
        onClick={handleGenerate}
        disabled={status === "loading"}
      >
        {status === "loading" ? <Spinner data-icon="inline-start" /> : <SparklesIcon data-icon="inline-start" />}
        {summary ? "Regenerate recommendation" : "Get AI recommendation"}
      </Button>
    </div>
  )
}
