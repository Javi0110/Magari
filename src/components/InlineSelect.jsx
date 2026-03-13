import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function InlineSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || null

  const handleSelect = (val) => {
    onChange && onChange(val)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <p className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700 mb-1">
          {label}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-full border border-greige-light bg-white/80 text-neutral-700 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/15 transition-colors"
      >
        <span className="truncate text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-greige-light rounded-2xl shadow-lg py-1 max-h-64 overflow-y-auto text-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-3 py-2 hover:bg-cream ${
                opt.value === value ? 'text-sage font-semibold' : 'text-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

