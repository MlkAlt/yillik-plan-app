interface ConfirmActionRowProps {
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmActionRow({
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgec',
  onConfirm,
  onCancel,
}: ConfirmActionRowProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={onConfirm}
        className="px-3 py-2 text-xs font-bold transition-all active:scale-95"
        style={{
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-danger)',
          color: '#ffffff',
          border: 'none',
          minHeight: 'var(--touch-target)',
        }}
      >
        {confirmLabel}
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-2 text-xs font-bold transition-all active:scale-95"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text2)',
          minHeight: 'var(--touch-target)',
        }}
      >
        {cancelLabel}
      </button>
    </div>
  )
}
