const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined

export function loadAdSense() {
  if (!ADSENSE_CLIENT) return
  if (document.querySelector('script[data-adsense]')) return

  const script = document.createElement('script')
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-adsense', '1')
  document.head.appendChild(script)
}
