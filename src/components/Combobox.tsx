'use client'

import { useEffect, useRef, useState } from 'react'

// Autocomplete cross-browser (no depende de <datalist>, que falla en Safari).
// Escribe para filtrar, clic para elegir. Permite también dejar texto libre.
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  // Sincroniza si el valor cambia desde fuera (p.ej. al cargar el perfil).
  useEffect(() => setQuery(value), [value])

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const safe = options.filter((o): o is string => typeof o === 'string' && o.length > 0)
  const q = query.trim().toLowerCase()
  const filtered = (q ? safe.filter(o => o.toLowerCase().includes(q)) : safe).slice(0, 50)

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={e => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="input"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white shadow-lg">
          {filtered.map(o => (
            <li
              key={o}
              onMouseDown={() => {
                onChange(o)
                setQuery(o)
                setOpen(false)
              }}
              className={`cursor-pointer px-3 py-1.5 text-sm hover:bg-brand-50 ${o === value ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink'}`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
