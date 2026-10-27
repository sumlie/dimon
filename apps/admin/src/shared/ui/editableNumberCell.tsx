'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useRef, useState } from 'react'

import { ERROR_COLOR, SUCCESS_COLOR, BORDER, BORDER_FOCUS, BG } from '@/shared/lib/theme'

type EditableNumberCellProps = DefaultCellComponentProps & {
  field?: {
    name?: string
    admin?: {
      custom?: {
        updateURL?: string
      }
    }
  }
}

const EditableNumberCell = ({ cellData, rowData, field }: EditableNumberCellProps) => {
  const initialValue = Number(cellData ?? 0)
  const fieldName = field?.name
  const updateURL = field?.admin?.custom?.updateURL

  const [input, setInput] = useState(String(initialValue))
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)

  const valueRef = useRef(initialValue)
  const inputRef = useRef(String(initialValue))
  const loadingRef = useRef(false)
  const focusedRef = useRef(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateInput = (next: string) => {
    inputRef.current = next
    setInput(next)
  }

  // Обновляем значение, если данные в таблице изменились извне
  useEffect(() => {
    const next = Number(cellData ?? 0)
    if (!focusedRef.current && !loadingRef.current) {
      valueRef.current = next
      updateInput(String(next))
    }
  }, [cellData])

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const reset = () => updateInput(String(valueRef.current))

  const save = async (nextValue: number) => {
    if (loadingRef.current || !fieldName || !updateURL) return

    loadingRef.current = true
    setLoading(true)
    setError(false)

    try {
      const response = await fetch(
        updateURL.replace(':id', encodeURIComponent(String(rowData.id))),
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: fieldName,
            value: nextValue,
            expectedValue: valueRef.current,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сохранить значение')
      }

      valueRef.current = result.value

      if (inputRef.current === String(nextValue)) {
        updateInput(String(result.value))
      }

      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 1500)
    } catch {
      reset()
      setError(true)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  const commit = () => {
    const raw = inputRef.current.trim().replace(',', '.')

    if (raw === '') {
      reset()
      return
    }

    const parsed = Number(raw)

    if (!Number.isFinite(parsed) || parsed < 0) {
      reset()
      setError(true)
      return
    }

    if (parsed === valueRef.current) {
      reset()
      return
    }

    void save(parsed)
  }

  const borderColor = error
    ? ERROR_COLOR
    : saved
      ? SUCCESS_COLOR
      : focused
        ? BORDER_FOCUS
        : BORDER

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        aria-label={fieldName ?? 'Числовое значение'}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={input}
        onFocus={(e) => {
          focusedRef.current = true
          setFocused(true)
          e.currentTarget.select()
        }}
        onChange={(e) => {
          const next = e.target.value

          if (!/^\d*[.,]?\d*$/.test(next)) return
          updateInput(next)
          setError(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') {
            reset()
            setError(false)
            e.currentTarget.blur()
          }
        }}
        onBlur={() => {
          focusedRef.current = false
          setFocused(false)
          commit()
        }}
        style={{
          width: 76,
          height: 26,
          padding: '0 10px',
          boxSizing: 'border-box',
          font: 'inherit',
          fontSize: 13,
          color: 'inherit',
          background: BG,
          border: `1px solid ${borderColor}`,
          borderRadius: 4,
          outline: 'none',
          opacity: loading ? 0.6 : 1,
          transition: 'border-color 0.15s, opacity 0.15s',
        }}
      />

      {error && (
        <span
          title="Не удалось сохранить. Обновите данные и попробуйте снова."
          style={{ color: ERROR_COLOR, fontWeight: 600, cursor: 'help' }}
        >
          !
        </span>
      )}
    </div>
  )
}

export default EditableNumberCell