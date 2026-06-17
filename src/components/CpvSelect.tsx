'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { CPV_DIVISIONES, cpvLabel } from '@/lib/cpv'

// Selector MÚLTIPLE de familias CPV (2 dígitos). Guarda un array de códigos.
// Se busca por texto (código o nombre) y se añaden como chips.
export function CpvSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (codes: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = (q
    ? CPV_DIVISIONES.filter(d => `${d.code} ${d.label}`.toLowerCase().includes(q))
    : CPV_DIVISIONES
  ).filter(d => !value.includes(d.code)).slice(0, 50)

  function add(code: string) {
    if (!value.includes(code)) onChange([...value, code])
    setQuery('')
  }
  function remove(code: string) {
    onChange(value.filter(c => c !== code))
  }

  return (
    <div className="relative" ref={ref}>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map(code => (
            <span key={code} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[12px] font-medium text-indigo-700">
              {cpvLabel(code)}
              <button type="button" onClick={() => remove(code)} className="text-indigo-400 hover:text-indigo-700" aria-label="Quitar">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        className="input"
        autoComplete="off"
        placeholder={placeholder ?? 'Busca tu sector (software, obras, sanidad…)'}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white shadow-lg">
          {filtered.map(d => (
            <li
              key={d.code}
              onMouseDown={() => add(d.code)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className="font-mono text-xs text-subtle">{d.code}</span> · {d.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
