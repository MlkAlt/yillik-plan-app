import { useEffect, useRef } from 'react'

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT as string | undefined

interface AdBannerProps {
  className?: string
}

export function AdBanner({ className = '' }: AdBannerProps) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // AdSense yüklenmediyse sessizce geç
    }
  }, [])

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
