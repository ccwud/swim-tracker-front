import React from 'react'
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const mappedVariant: ShadcnButtonProps['variant'] =
    variant === 'primary' ? 'default' : variant

  return (
    <ShadcnButton
      variant={mappedVariant}
      className={cn(fullWidth ? 'w-full' : '', className)}
      {...props}
    >
      {children}
    </ShadcnButton>
  )
}