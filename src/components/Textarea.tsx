import * as React from 'react'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean
  invalid?: boolean
}

export default function Textarea({ fullWidth = false, invalid = false, className, ...props }: TextareaProps) {
  return (
    <ShadcnTextarea
      className={cn(fullWidth ? 'w-full' : '', invalid ? 'border-destructive focus-visible:ring-destructive' : '', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}