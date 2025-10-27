import React from 'react'

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
  const classes = [
    'input',
    fullWidth ? 'input--full' : '',
    invalid ? 'input--invalid' : '',
    className || ''
  ]
    .filter(Boolean)
    .join(' ')

  return <input className={classes} aria-invalid={invalid || undefined} {...props} />
}