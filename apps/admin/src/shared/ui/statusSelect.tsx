'use client'

import { useRef, useState } from 'react'

import { statusColors } from '@/shared/lib/statusColors'
import { ERROR_COLOR } from '@/shared/lib/theme'

export type SelectOption = {
  label: string
  value: string | number | boolean
}

type Props = {
  fieldName: string
  updateURL: string
  id: string | number
  value?: string | null
  options: SelectOption[]
}

export function StatusSelect({ fieldName, updateURL, id, value: initial, options }: Props) {
  const initialValue = initial == null ? '' : String(initial)
  const savedValue = useRef(initialValue)

  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const color = error ? ERROR_COLOR : (statusColors[value] ?? 'currentColor')

  const save = async (next: string) => {
    if (loading || next === savedValue.current) return

    const option = options.find((o) => String(o.value) === next)
    if (!option) return

    const previous = savedValue.current

    setValue(next)
    setLoading(true)
    setError(false)

    try {
      const response = await fetch(updateURL.replace(':id', encodeURIComponent(String(id))), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: fieldName,
          value: option.value,
          expectedValue: previous,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить значение')

      savedValue.current = String(result.value)
      setValue(savedValue.current)
    } catch {
      setValue(previous)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
      title={error ? 'Не удалось сохранить. Обновите страницу и попробуйте снова.' : undefined}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 9,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          pointerEvents: 'none',
        }}
      />

      <select
        aria-label={fieldName}
        aria-invalid={error}
        value={value}
        disabled={loading}
        onChange={(e) => void save(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          margin: 0,
          height: 28,
          padding: '0 24px',
          font: 'inherit',
          fontSize: 13,
          fontWeight: 500,
          color,
          background: `color-mix(in srgb, ${color} 14%, transparent)`,
          border: 'none',
          borderRadius: 4,
          outline: 'none',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {options.map((o) => (
          <option
            key={String(o.value)}
            value={String(o.value)}
            style={{ color: 'CanvasText', backgroundColor: 'Canvas' }}
          >
            {o.label}
          </option>
        ))}
      </select>

      <svg
        aria-hidden
        width="10"
        height="10"
        viewBox="0 0 10 10"
        style={{ position: 'absolute', right: 8, pointerEvents: 'none', color }}
      >
        <path
          d="M2 3.5 5 6.5 8 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}