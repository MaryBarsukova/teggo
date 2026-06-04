import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface BottomsheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  fullHeight?: boolean
}

export function Bottomsheet({ open, onClose, children, fullHeight = false }: BottomsheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const delta = e.changedTouches[0].clientY - startY.current
    if (delta > 60) onClose()
    startY.current = null
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'relative',
          width: 'min(430px, 100vw)',
        }}
      >
        <div
          ref={sheetRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full rounded-t-[20px] overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            maxHeight: fullHeight ? '92vh' : '85vh',
            animation: 'slideUp 250ms ease-out',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: fullHeight ? 'calc(92vh - 32px)' : 'calc(85vh - 32px)' }}>
            {children}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  )
}
