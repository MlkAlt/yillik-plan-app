import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'
import { TarihEkleForm } from '../components/Takvim/TarihEkleForm'
import type { OnemliTarih } from '../types/onemliTarih'

interface OnemliTarihlerPageProps {
  yil?: string
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const GUNLER_KISA = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

const KATEGORI_RENK: Record<string, string> = {
  sinav:   '#DC2626',
  toplanti: '#4F6AF5',
  etkinlik: '#059669',
  son_tarih: '#D97706',
  diger:   '#9B9B97',
}

function TakvimGrid({ tarihler, yil, ay }: { tarihler: OnemliTarih[]; yil: number; ay: number }) {
  const ilkGun = new Date(yil, ay, 1)
  const sonGun = new Date(yil, ay + 1, 0)
  const ilkHucre = (ilkGun.getDay() + 6) % 7 // Pazartesi = 0
  const bugun = new Date()
  const bugunStr = bugun.toISOString().split('T')[0]

  const hucreler: (number | null)[] = Array(ilkHucre).fill(null)
  for (let d = 1; d <= sonGun.getDate(); d++) hucreler.push(d)
  while (hucreler.length % 7 !== 0) hucreler.push(null)

  function gunuTarihStr(gun: number) {
    return `${yil}-${String(ay + 1).padStart(2, '0')}-${String(gun).padStart(2, '0')}`
  }

  function tarihVar(gun: number) {
    const str = gunuTarihStr(gun)
    return tarihler.some(t => t.tarih === str || t.tarih.startsWith(str))
  }

  return (
    <div>
      {/* Gün başlıkları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {GUNLER_KISA.map(g => (
          <div key={g} className="text-center font-sans font-semibold" style={{ fontSize: 11, color: 'var(--color-text3)', padding: '4px 0' }}>{g}</div>
        ))}
      </div>
      {/* Hücreler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {hucreler.map((gun, i) => {
          if (gun === null) return <div key={`e-${i}`} />
          const str = gunuTarihStr(gun)
          const bugunMu = str === bugunStr
          const tarihliMi = tarihVar(gun)
          const gecmisMi = str < bugunStr
          return (
            <div
              key={str}
              className="flex flex-col items-center justify-center"
              style={{ height: 36, borderRadius: 8, position: 'relative' }}
            >
              <span
                className="font-sans font-semibold flex items-center justify-center"
                style={{
                  width: 30, height: 30, borderRadius: '50%', fontSize: 13,
                  background: bugunMu ? 'var(--color-primary)' : 'transparent',
                  color: bugunMu ? '#fff' : gecmisMi ? 'var(--color-text3)' : 'var(--color-text1)',
                  fontWeight: bugunMu ? 700 : 400,
                }}
              >
                {gun}
              </span>
              {tarihliMi && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: bugunMu ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)', position: 'absolute', bottom: 3 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OnemliTarihlerPage({ yil = '2025-2026' }: OnemliTarihlerPageProps) {
  const navigate = useNavigate()
  const { tarihler, ekle, sil, mebTakviminiYukle } = useOnemliTarihler()
  const [formAcik, setFormAcik] = useState(false)
  const [aktifTab, setAktifTab] = useState<'yaklasan' | 'gecmis'>('yaklasan')
  const [aktifKategori, setAktifKategori] = useState<string>('tumu')

  const simdi = new Date()
  const [gorunenAy, setGorunenAy] = useState(simdi.getMonth())
  const [gorunenYil, setGorunenYil] = useState(simdi.getFullYear())

  useEffect(() => {
    mebTakviminiYukle(yil)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yil])

  function handleEkle(tarih: OnemliTarih) {
    ekle(tarih)
    setFormAcik(false)
  }

  // Stat hesaplama
  const bugunStr = simdi.toISOString().split('T')[0]
  const yaklasanlar = tarihler.filter(t => t.tarih >= bugunStr)
  const gecmisler = tarihler.filter(t => t.tarih < bugunStr)

  // Kategoriler
  const kategoriler = ['tumu', 'sinav', 'toplanti', 'etkinlik', 'son_tarih', 'diger']
  const kategoriAd: Record<string, string> = {
    tumu: 'Tüm Kategoriler',
    sinav: 'Sınav',
    toplanti: 'Toplantı',
    etkinlik: 'Etkinlik',
    son_tarih: 'Son Tarih',
    diger: 'Diğer',
  }

  const gorunenListe = (aktifTab === 'yaklasan' ? yaklasanlar : gecmisler)
    .filter(t => aktifKategori === 'tumu' || t.kategori === aktifKategori)
    .sort((a, b) => a.tarih.localeCompare(b.tarih) * (aktifTab === 'gecmis' ? -1 : 1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 24 }}>
      {/* Başlık */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} style={{ color: 'var(--color-text2)' }} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold" style={{ fontSize: 20, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>Takvim</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text3)' }}>Önemli tarihleri takip edin, bildirim alın</p>
        </div>
        <button
          onClick={() => setFormAcik(true)}
          className="flex items-center gap-2 font-sans font-bold"
          style={{ height: 36, padding: '0 14px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer' }}
        >
          <Plus size={14} /> Tarih Ekle
        </button>
      </div>

      {/* Takvim kartı */}
      <div style={{ padding: '12px 16px 0' }}>
        <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {/* Ay navigasyonu */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16 }}>📅</span>
              <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--color-text1)' }}>
                {AYLAR[gorunenAy]} {gorunenYil}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (gorunenAy === 0) { setGorunenAy(11); setGorunenYil(y => y - 1) }
                  else setGorunenAy(m => m - 1)
                }}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 32, height: 32, background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} style={{ color: 'var(--color-text2)' }} />
              </button>
              <button
                onClick={() => {
                  if (gorunenAy === 11) { setGorunenAy(0); setGorunenYil(y => y + 1) }
                  else setGorunenAy(m => m + 1)
                }}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 32, height: 32, background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              >
                <ChevronRight size={16} style={{ color: 'var(--color-text2)' }} />
              </button>
            </div>
          </div>

          <TakvimGrid tarihler={tarihler} yil={gorunenYil} ay={gorunenAy} />
        </div>
      </div>

      {/* Stat chips */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 8 }}>
        {[
          { label: 'Yaklaşan', deger: yaklasanlar.length, renk: 'var(--color-primary)' },
          { label: 'Geçmiş',   deger: gecmisler.length,   renk: 'var(--color-success)' },
          { label: 'Toplam',   deger: tarihler.length,    renk: 'var(--color-accent)' },
        ].map(chip => (
          <div
            key={chip.label}
            className="flex-1 flex flex-col items-center justify-center rounded-xl py-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="font-display font-bold" style={{ fontSize: 20, color: chip.renk, letterSpacing: '-0.03em' }}>{chip.deger}</p>
            <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>{chip.label}</p>
          </div>
        ))}
      </div>

      {/* Kategori filtresi */}
      <div style={{ padding: '10px 16px 0' }}>
        <select
          value={aktifKategori}
          onChange={e => setAktifKategori(e.target.value)}
          className="w-full font-sans"
          style={{ height: 40, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text1)', fontSize: 13, padding: '0 12px', outline: 'none', cursor: 'pointer' }}
        >
          {kategoriler.map(k => (
            <option key={k} value={k}>{kategoriAd[k]}</option>
          ))}
        </select>
      </div>

      {/* Tab switcher */}
      <div style={{ padding: '10px 16px 0' }}>
        <div className="flex" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
          <button
            onClick={() => setAktifTab('yaklasan')}
            className="flex-1 font-sans font-semibold"
            style={{ height: 34, borderRadius: 'var(--radius-pill)', fontSize: 13, background: aktifTab === 'yaklasan' ? '#fff' : 'transparent', color: aktifTab === 'yaklasan' ? 'var(--color-primary)' : 'var(--color-text3)', border: 'none', cursor: 'pointer', boxShadow: aktifTab === 'yaklasan' ? 'var(--shadow-xs)' : 'none' }}
          >
            Yaklaşan ({yaklasanlar.length})
          </button>
          <button
            onClick={() => setAktifTab('gecmis')}
            className="flex-1 font-sans font-semibold"
            style={{ height: 34, borderRadius: 'var(--radius-pill)', fontSize: 13, background: aktifTab === 'gecmis' ? '#fff' : 'transparent', color: aktifTab === 'gecmis' ? 'var(--color-primary)' : 'var(--color-text3)', border: 'none', cursor: 'pointer', boxShadow: aktifTab === 'gecmis' ? 'var(--shadow-xs)' : 'none' }}
          >
            Geçmiş ({gecmisler.length})
          </button>
        </div>
      </div>

      {/* Tarih listesi */}
      <div style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gorunenListe.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <p style={{ fontSize: 32 }}>📅</p>
            <p style={{ fontSize: 14, color: 'var(--color-text3)' }}>
              {aktifTab === 'yaklasan' ? 'Yaklaşan tarih yok' : 'Geçmiş tarih yok'}
            </p>
            {aktifTab === 'yaklasan' && (
              <button
                onClick={() => setFormAcik(true)}
                className="font-sans font-semibold"
                style={{ fontSize: 13, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Tarih Ekle
              </button>
            )}
          </div>
        ) : (
          gorunenListe.map(tarih => {
            const kategoriRenk = KATEGORI_RENK[tarih.kategori] || KATEGORI_RENK.diger
            return (
              <div
                key={tarih.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${kategoriRenk}` }}
              >
                {/* Tarih badge */}
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: `${kategoriRenk}15` }}
                >
                  <p className="font-display font-bold" style={{ fontSize: 15, color: kategoriRenk, lineHeight: 1 }}>
                    {new Date(tarih.tarih).getDate()}
                  </p>
                  <p style={{ fontSize: 10, color: kategoriRenk, fontWeight: 600 }}>
                    {AYLAR[new Date(tarih.tarih).getMonth()].slice(0, 3)}
                  </p>
                </div>
                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold truncate" style={{ fontSize: 14, color: 'var(--color-text1)' }}>{tarih.baslik}</p>
                  {tarih.aciklama && (
                    <p className="truncate" style={{ fontSize: 12, color: 'var(--color-text3)' }}>{tarih.aciklama}</p>
                  )}
                  <span
                    className="font-sans font-semibold inline-block mt-1"
                    style={{ fontSize: 11, color: kategoriRenk, background: `${kategoriRenk}15`, padding: '1px 8px', borderRadius: 'var(--radius-pill)' }}
                  >
                    {kategoriAd[tarih.kategori] || 'Diğer'}
                  </span>
                </div>
                {/* Sil */}
                <button
                  onClick={() => sil(tarih.id)}
                  className="flex-shrink-0 font-sans"
                  style={{ fontSize: 18, color: 'var(--color-text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  ×
                </button>
              </div>
            )
          })
        )}
      </div>

      {formAcik && (
        <TarihEkleForm
          onKaydet={handleEkle}
          onKapat={() => setFormAcik(false)}
        />
      )}
    </div>
  )
}
