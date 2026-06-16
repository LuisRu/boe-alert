'use client'

import { useEffect, useRef, useState } from 'react'
import { CNAE_DIVISIONES, cnaeDisplay } from '@/lib/cnae'

// Selector de actividad CNAE: se busca por texto (código o nombre) y solo se
// guarda el CÓDIGO al elegir una opción. El texto libre no se persiste.
export function CnaeSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string | null
  onChange: (code: string | null) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Cuando está cerrado, el input muestra la etiqueta del código guardado.
  useEffect(() => {
    if (!open) setQuery(cnaeDisplay(value))
  }, [value, open])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = (q
    ? CNAE_DIVISIONES.filter(d => `${d.code} ${d.label}`.toLowerCase().includes(q))
    : CNAE_DIVISIONES
  ).slice(0, 50)

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        className="input"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onFocus={() => { setOpen(true); setQuery('') }}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white shadow-lg">
          {filtered.map(d => (
            <li
              key={d.code}
              onMouseDown={() => { onChange(d.code); setQuery(`${d.code} · ${d.label}`); setOpen(false) }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className="font-mono text-xs text-subtle">{d.code}</span> · {d.label}
            </li>
          ))}
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-subtle">Sin resultados</li>}
          {value && (
            <li
              onMouseDown={() => { onChange(null); setQuery(''); setOpen(false) }}
              className="cursor-pointer border-t border-line px-3 py-2 text-sm text-subtle hover:bg-slate-50"
            >
              Quitar selección
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
