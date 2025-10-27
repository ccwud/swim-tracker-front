import { forwardRef } from 'react'
import type { DetailedHTMLProps, SelectHTMLAttributes } from 'react'

type NativeSelectProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

interface Props extends NativeSelectProps {
  fullWidth?: boolean
  invalid?: boolean
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, fullWidth, invalid, disabled, ...props },
  ref,
) {
  const classes = ['select']
  if (fullWidth) classes.push('select--full')
  if (invalid) classes.push('select--invalid')
  if (disabled) classes.push('select--disabled')
  if (className) classes.push(className)

  return <select ref={ref} className={classes.join(' ')} disabled={disabled} {...props} />
})

export default Select