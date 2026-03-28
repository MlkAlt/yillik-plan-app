import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { LeadFormData } from '../../types/lead'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const initialFormData: LeadFormData = {
  ad: '',
  soyad: '',
  email: '',
  okul: '',
  telefon: '',
}

interface LeadFormProps {
  embedded?: boolean
}

export function LeadForm({ embedded = false }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const { error } = await supabase.from('leads').insert([formData])

      if (error) throw error

      setStatus('success')
      setFormData(initialFormData)
    } catch (err: unknown) {
      setStatus('error')
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Beklenmeyen bir hata oluştu.')
      }
    }
  }

  const fields: { name: keyof LeadFormData; label: string; type: string; placeholder: string }[] = [
    { name: 'ad', label: 'Ad', type: 'text', placeholder: 'Adınız' },
    { name: 'soyad', label: 'Soyad', type: 'text', placeholder: 'Soyadınız' },
    { name: 'email', label: 'E-posta', type: 'email', placeholder: 'ornek@mail.com' },
    { name: 'okul', label: 'Okul', type: 'text', placeholder: 'Okul adı' },
    { name: 'telefon', label: 'Telefon', type: 'tel', placeholder: '05XX XXX XX XX' },
  ]

  const successCard = (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center mx-auto">
      <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1C1917] mb-2">Teşekkürler!</h2>
      <p className="text-gray-500 mb-6">Bilgileriniz başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.</p>
      <button
        onClick={() => setStatus('idle')}
        className="text-[#2D5BE3] font-medium hover:underline text-sm"
      >
        Tekrar gönder
      </button>
    </div>
  )

  if (status === 'success') {
    if (embedded) return successCard
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        {successCard}
      </div>
    )
  }

  const formCard = (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full mx-auto">
        {/* İç içerik — header yalnızca standalone modda göster */}
        {!embedded && (
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-[#2D5BE3]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#2D5BE3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1C1917]">Yıllık Plan Uygulaması</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ücretsiz erken erişim için bilgilerinizi bırakın
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-[#1C1917] mb-1">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40 focus:border-transparent
                  transition duration-150"
              />
            </div>
          ))}

          {/* Hata mesajı */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {errorMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#2D5BE3] hover:bg-[#2D5BE3]/90 disabled:bg-[#2D5BE3]/40
              text-white font-semibold py-3 rounded-xl text-sm
              transition duration-150 flex items-center justify-center gap-2 mt-2"
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gönderiliyor...
              </>
            ) : (
              'Erken Erişim İstiyorum'
            )}
          </button>

          <p className="text-xs text-center text-gray-400 mt-2">
            Bilgileriniz üçüncü şahıslarla paylaşılmaz.
          </p>
        </form>
    </div>
  )

  if (embedded) return formCard

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      {formCard}
    </div>
  )
}
