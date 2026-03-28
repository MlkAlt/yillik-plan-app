export interface Lead {
  id?: string
  ad: string
  soyad: string
  email: string
  okul: string
  telefon: string
  created_at?: string
}

export type LeadFormData = Omit<Lead, 'id' | 'created_at'>
