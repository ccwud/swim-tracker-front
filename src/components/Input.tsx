import React from 'react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
  invalid?: boolean
}

export default function Input({
  fullWidth = false,
  invalid = false,
  className,
  ...props
}: InputProps) {
  return (
    <ShadcnInput
      className={cn(fullWidth ? 'w-full' : '', invalid ? 'border-destructive focus-visible:ring-destructive' : '', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}