import { useState } from 'react'
import { createPortal } from 'react-dom'
import { signIn, signUp } from '../../lib/auth'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'giris' | 'kayit'>('giris')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (tab === 'giris') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password)
        setSuccess('Kayıt başarılı! E-postanı kontrol et ve hesabını doğrula.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu.'
      if (msg.includes('Invalid login credentials')) setError('E-posta veya şifre hatalı.')
      else if (msg.includes('User already registered')) setError('Bu e-posta zaten kayıtlı.')
      else if (msg.includes('Password should be')) setError('Şifre en az 6 karakter olmalı.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-sm mx-auto p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1C1917]">
            {tab === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab seçici */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => { setTab('giris'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'giris' ? 'bg-white text-[#2D5BE3] shadow-sm' : 'text-gray-500'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setTab('kayit'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'kayit' ? 'bg-white text-[#2D5BE3] shadow-sm' : 'text-gray-500'
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
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

          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <p className="text-green-600 text-xs font-medium">{success}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs font-bold text-green-700 underline"
              >
                Tamam
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-[#2D5BE3] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 mt-1"
          >
            {loading ? <span className="animate-pulse">İşleniyor...</span> : tab === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {tab === 'giris'
            ? 'Hesabın yok mu? Kayıt olmak ücretsiz.'
            : 'Planların buluta kaydedilir ve tüm cihazlarında erişilebilir olur.'
          }
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
