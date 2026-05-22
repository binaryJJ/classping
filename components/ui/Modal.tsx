'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-t-2xl overflow-hidden"
        style={{ background: 'var(--c-surface)', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-4 py-3.5 w-divider" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <h2 className="text-base font-bold text-w-heading">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full t-base hover:bg-w-subtle"
          >
            <X size={18} color="var(--c-secondary)" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>{children}</div>
      </div>
    </div>
  )
}
