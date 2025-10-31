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
        // 当 option children 为复杂节点时，从 data-label 或 label 属性提取纯文本用于搜索
        const propsAny = opt.props as Record<string, unknown>
        const children = opt.props.children
        const labelText =
          typeof children === 'string'
            ? children
            : (typeof propsAny['data-label'] === 'string'
                ? (propsAny['data-label'] as string)
                : (typeof opt.props.label === 'string'
                    ? opt.props.label
                    : ''))
        const label = String(labelText ?? '')
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

          // 提取数据属性：图标与颜色；兼容 children 为纯文本或复杂节点
          const propsAny = opt.props as Record<string, unknown>
          const children = opt.props.children
          const displayLabel =
            typeof children === 'string'
              ? children
              : (typeof propsAny['data-label'] === 'string'
                  ? (propsAny['data-label'] as string)
                  : (typeof opt.props.label === 'string'
                      ? opt.props.label
                      : ''))
          const icon = typeof propsAny['data-icon'] === 'string' ? (propsAny['data-icon'] as string) : undefined
          const color = typeof propsAny['data-color'] === 'string' ? (propsAny['data-color'] as string) : undefined

          return (
            <SelectItem key={idx} value={itemValue} disabled={!!opt.props.disabled}>
              <span className="inline-flex items-center gap-2">
                {color ? (
                  <span
                    aria-hidden
                    className="inline-block w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ) : null}
                {icon ? (
                  <span aria-hidden className="text-base leading-none">{icon}</span>
                ) : null}
                <span className="truncate">{displayLabel}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </RadixSelect>
  )
}