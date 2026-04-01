import { useState } from 'react'
import { createPortal } from 'react-dom'
import { signInWithMagicLink, signIn, signUp } from '../../lib/auth'
import { Mail, Lock, ChevronDown } from 'lucide-react'
import { StorageKeys } from '../../lib/storageKeys'

interface AuthModalProps {
  onClose: () => void
  mode?: 'default' | 'prompt'
  planBaglami?: { ders: string; sinif: string }
}

const MOTIVASYON_MADDELERI = [
  { metin: 'Telefon değişse de planların kaybolmaz' },
  { metin: 'Geçen yılın planını bir tıkla tekrar kullan' },
  { metin: 'Meslektaşlarınla kolayca paylaş' },
]

export function AuthModal({ onClose, mode = 'default', planBaglami }: AuthModalProps) {
  const isPrompt = mode === 'prompt'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sifreSuccess, setSifreSuccess] = useState('')
  const [sifreTab, setSifreTab] = useState<'giris' | 'kayit'>('giris')
  const [magicLinkAcik, setMagicLinkAcik] = useState(false)
  const [magicLinkGonderildi, setMagicLinkGonderildi] = useState(false)

  async function handleSifreliGiris(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSifreSuccess('')
    setLoading(true)
    try {
      if (sifreTab === 'giris') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password)
        setSifreSuccess('Kayıt başarılı! E-postana doğrulama maili gönderdik.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu.'
      if (msg.includes('Invalid login credentials')) setError('E-posta veya şifre hatalı.')
      else if (msg.includes('User already registered')) setError('Bu e-posta zaten kayıtlı.')
      else if (msg.includes('Password should be')) setError('Şifre en az 6 karakter olmalı.')
      else setError('Bir hata oluştu. Lütfen tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)
    try {
      await signInWithMagicLink(email.trim())
      setMagicLinkGonderildi(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu.'
      setError(msg ? 'Bağlantı gönderilemedi. Lütfen tekrar dene.' : 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-2xl w-full max-w-sm mx-auto p-6 shadow-xl">
        {/* Kapat */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>

        {/* Prompt modu motivasyon */}
        {isPrompt && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#1C1917] mb-1">İlerlemeyi kaydet</h2>
            {planBaglami && (
              <p className="text-xs text-[#2D5BE3] font-semibold mb-3">
                Tamamladığın haftalar kaybolmasın
              </p>
            )}
            <div className="flex flex-col gap-1.5 mb-4">
              {MOTIVASYON_MADDELERI.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-[#2D5BE3] flex-shrink-0" />
                  {m.metin}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPrompt && (
          <h2 className="text-lg font-bold text-[#1C1917] mb-5">Giriş Yap</h2>
        )}

        {/* Magic link gönderildi */}
        {magicLinkGonderildi ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-[#2D5BE3]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={22} className="text-[#2D5BE3]" />
            </div>
            <p className="font-bold text-[#1C1917] mb-1">Bağlantı gönderildi</p>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-[#1C1917]">{email}</span> adresine giriş bağlantısı gönderdik. Maili kontrol et ve bağlantıya tıkla.
            </p>
            <button
              onClick={() => { setMagicLinkGonderildi(false); setEmail('') }}
              className="text-xs text-[#2D5BE3] font-semibold hover:underline"
            >
              Farklı e-posta dene
            </button>
          </div>
        ) : (
          <>
            {/* Şifreli giriş — BİRİNCİL, her zaman görünür */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
              <button
                type="button"
                onClick={() => { setSifreTab('giris'); setError(''); setSifreSuccess('') }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${sifreTab === 'giris' ? 'bg-white text-[#2D5BE3] shadow-sm' : 'text-gray-500'}`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { setSifreTab('kayit'); setError(''); setSifreSuccess('') }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${sifreTab === 'kayit' ? 'bg-white text-[#2D5BE3] shadow-sm' : 'text-gray-500'}`}
              >
                Kayıt Ol
              </button>
            </div>

            <form onSubmit={handleSifreliGiris} className="flex flex-col gap-2 mb-4">
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/30 focus:border-[#2D5BE3] transition-all"
              />
              <input
                type="password"
                placeholder="Şifre (en az 6 karakter)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/30 focus:border-[#2D5BE3] transition-all"
              />

              {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              {sifreSuccess && <p className="text-green-600 text-xs bg-green-50 border border-green-100 rounded-lg px-3 py-2">{sifreSuccess}</p>}

              <button
                type="submit"
                disabled={loading || !!sifreSuccess}
                className="w-full bg-[#2D5BE3] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <span className="animate-pulse">İşleniyor...</span> : sifreTab === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            {/* Magic link — accordion, ikincil */}
            <div className="border-t border-[#E7E5E4] pt-3">
              <button
                type="button"
                onClick={() => setMagicLinkAcik(p => !p)}
                className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Lock size={12} />
                  Şifresiz giriş yap (e-posta bağlantısı)
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${magicLinkAcik ? 'rotate-180' : ''}`} />
              </button>

              {magicLinkAcik && (
                <div className="mt-3">
                  <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
                    <input
                      type="email"
                      placeholder="E-posta adresin"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/30 focus:border-[#2D5BE3] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full bg-gray-700 text-white py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Mail size={14} />
                      {loading ? <span className="animate-pulse">Gönderiliyor...</span> : 'Bağlantı Gönder'}
                    </button>
                  </form>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    E-postana tek kullanımlık giriş bağlantısı göndereceğiz.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {isPrompt && !magicLinkGonderildi && (
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(StorageKeys.AUTH_PROMPT_GOSTERILDI, '1')
              onClose()
            }}
            className="w-full text-center text-xs text-gray-400 mt-3 py-2 hover:text-gray-600 transition-colors"
          >
            Şimdi değil
          </button>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
