'use client'

import type { DefaultCellComponentProps } from 'payload'

import { StatusSelect, type SelectOption } from '../ui/StatusSelect'

type Props = DefaultCellComponentProps & {
  field?: {
    name?: string
    options?: (SelectOption | string)[]
    admin?: { custom?: { updateURL?: string } }
  }
}

const EditableSelectCell = ({ cellData, rowData, field }: Props) => {
  const updateURL = field?.admin?.custom?.updateURL
  if (!field?.name || !updateURL) return <span>{String(cellData ?? '—')}</span>

  const options = (field.options ?? []).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  )

  return (
    <StatusSelect
      fieldName={field.name}
      updateURL={updateURL}
      id={rowData.id}
      value={cellData as string | null}
      options={options}
    />
  )
}

export default EditableSelectCell