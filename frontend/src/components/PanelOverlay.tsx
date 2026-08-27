import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'

interface PanelOverlayProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function PanelOverlay({ title, onClose, children }: PanelOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="overlay-backdrop" onClick={handleBackdropClick}>
      <div className="overlay-panel" role="dialog" aria-modal="true" aria-label={title}>
        <button ref={closeButtonRef} type="button" className="overlay-close" onClick={onClose} aria-label="Close detail view">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
