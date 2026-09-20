"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePickerField({
  id,
  name,
  value,
  onChange,
  placeholder = "Pick a date",
  ariaInvalid,
}: {
  id?: string
  name: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  ariaInvalid?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              data-empty={!value}
              aria-invalid={ariaInvalid}
              className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        name={name}
        value={value ? format(value, "yyyy-MM-dd") : ""}
      />
    </>
  )
}
