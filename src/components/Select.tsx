import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Select as RadixSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { Input as SearchInput } from '@/components/ui/input'

export interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  fullWidth?: boolean
  invalid?: boolean
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  noResultsText?: string
}

export default function Select({
  className,
  fullWidth,
  invalid,
  disabled,
  children,
  value,
  defaultValue,
  onChange,
  placeholder,
  name,
  required,
  searchable,
  searchPlaceholder,
  noResultsText,
}: Props) {
  const EMPTY_VALUE_SENTINEL = '__EMPTY__'
  const mapIn = (s?: string | number | readonly string[]) => {
    if (typeof s === 'string') return s.length === 0 ? undefined : s
    if (typeof s === 'number') return String(s)
    return undefined
  }
  // 将原生 <option> 子节点转换为 Radix SelectItem
  const rawOptions = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>> =>
      React.isValidElement(child) && child.type === 'option'
  )
  const placeholderOption = rawOptions.find(
    (opt) => opt.props.value === '' || opt.props.value === undefined
  )
  const options = rawOptions.filter((opt) => opt !== placeholderOption)
  const derivedPlaceholder =
    placeholder ?? (placeholderOption ? String(placeholderOption.props.children ?? '') : undefined)
  const [query, setQuery] = React.useState('')
  const filtered = searchable
    ? options.filter((opt) => {
        const label = String(opt.props.children ?? '')
        const val = String(opt.props.value ?? '')
        const q = query.trim().toLowerCase()
        return label.toLowerCase().includes(q) || val.toLowerCase().includes(q)
      })
    : options

  // 选中值的本地回退，用于未受控或外部暂未及时传值时保持 UI 同步
  const [selected, setSelected] = React.useState<string | undefined>(() => mapIn(value) ?? mapIn(defaultValue))
  React.useEffect(() => {
    const v = mapIn(value)
    // 仅当外部值变化时同步本地，以免覆盖用户选择
    setSelected(v)
  }, [value])

  return (
    <RadixSelect
      value={mapIn(value) ?? selected}
      defaultValue={mapIn(defaultValue)}
      onValueChange={(v) => {
        if (onChange) {
          const next = v === EMPTY_VALUE_SENTINEL ? '' : v
          onChange({ target: { value: next } } as unknown as React.ChangeEvent<HTMLSelectElement>)
        }
        setSelected(v === EMPTY_VALUE_SENTINEL ? undefined : v)
      }}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          fullWidth ? 'w-full' : '',
          invalid ? 'border-destructive focus-visible:ring-destructive' : '',
          className
        )}
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder={derivedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {searchable && (
          <div className="p-2 border-b">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder ?? '搜索...'}
              className="h-8"
              aria-label="筛选选项"
            />
          </div>
        )}
        {searchable && <SelectSeparator />}
        {(filtered.length === 0 && searchable) ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">{noResultsText ?? '无匹配项'}</div>
        ) : filtered.map((opt, idx) => {
          const rawVal = opt.props.value ?? String(opt.props.children ?? '')
          const valStr = String(rawVal)
          const itemValue = valStr.length === 0 ? EMPTY_VALUE_SENTINEL : valStr
          return (
            <SelectItem key={idx} value={itemValue} disabled={!!opt.props.disabled}>
              {opt.props.children}
            </SelectItem>
          )
        })}
      </SelectContent>
    </RadixSelect>
  )
}