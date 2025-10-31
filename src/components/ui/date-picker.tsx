import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import Input from "@/components/Input"
import { zhCN } from "date-fns/locale"
import type { Locale } from "date-fns"

export interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  locale?: Locale
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map((n) => Number(n))
  if (!y || !m || !d) return undefined
  const dt = new Date(y, m - 1, d)
  return Number.isNaN(dt.getTime()) ? undefined : dt
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "选择日期", disabled, className, locale }) => {
  const [open, setOpen] = React.useState(false)
  const selected = React.useMemo(() => parseDate(value), [value])
  const usedLocale = locale ?? zhCN

  const handleSelect = (d?: Date) => {
    if (!d) return
    const v = formatDate(d)
    onChange?.(v)
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Input
          readOnly
          value={value || ""}
          placeholder={placeholder}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen(true)
          }}
          disabled={disabled}
          className={cn("cursor-pointer", className)}
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content sideOffset={6} className="z-50 rounded-md border bg-popover text-popover-foreground shadow-md p-2" aria-label="选择日期">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            showOutsideDays
            weekStartsOn={1}
            locale={usedLocale}
            classNames={{
              months: "flex flex-col space-y-2",
              month: "space-y-2",
              caption: "flex justify-center pt-1 relative items-center",
              nav: "flex items-center justify-between",
              table: "w-full border-collapse",
              head_row: "flex justify-between",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              day_selected: "bg-primary text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}