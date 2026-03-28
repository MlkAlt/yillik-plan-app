import type { PlanEntry } from '../types/planEntry'
import type { ParsedRow } from './fileParser'

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function getMonthName(isoDate: string): string {
  return AYLAR[new Date(isoDate).getMonth()]
}

export interface ExportMeta {
  okulAdi?: string
  ogretmenAdi?: string
}

// ─── EXCEL ───────────────────────────────────────────────────────────────────

export async function exportPlanToExcel(entry: PlanEntry, meta: ExportMeta = {}) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Yıllık Plan', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const { ders, sinifGercek, sinif, yil } = entry
  const sinifGoster = sinifGercek || sinif
  const okulAdi = meta.okulAdi || ''
  const ogretmenAdi = meta.ogretmenAdi || ''

  // Sütun genişlikleri
  ws.columns = [
    { width: 9 },   // A — AY
    { width: 8 },   // B — HAFTA
    { width: 7 },   // C — SAAT
    { width: 36 },  // D — HEDEF VE KAZANIMLAR
    { width: 46 },  // E — KONULAR
    { width: 22 },  // F — ÖĞRENME ÖĞRETME YÖNTEM
    { width: 24 },  // G — KULLANILAN ARAÇLAR
    { width: 14 },  // H — DEĞERLENDİRME
  ]

  // Ortak stiller
  const thin = { style: 'thin' as const, color: { argb: 'FF9CA3AF' } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }
  const boldBorder = {
    top: { style: 'medium' as const }, bottom: { style: 'medium' as const },
    left: { style: 'medium' as const }, right: { style: 'medium' as const },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type CellStyle = any

  function titleStyle(size = 13): CellStyle {
    return {
      font: { bold: true, size, name: 'Calibri', color: { argb: 'FF1e3a5f' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } },
    }
  }

  function headerStyle(): CellStyle {
    return {
      font: { bold: true, size: 9, name: 'Calibri', color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5BE3' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: boldBorder,
    }
  }

  function dataStyle(center = false): CellStyle {
    return {
      font: { size: 9, name: 'Calibri' },
      alignment: { horizontal: center ? 'center' : 'left', vertical: 'middle', wrapText: true },
      border,
    }
  }

  // ── Başlık satırları ──────────────────────────────────────────────────────

  const r1 = ws.addRow(Array(8).fill(''))
  r1.height = 24
  ws.mergeCells('A1:H1')
  const c1 = ws.getCell('A1')
  c1.value = okulAdi ? `${okulAdi} — ${yil} EĞİTİM ÖĞRETİM YILI` : `${yil} EĞİTİM ÖĞRETİM YILI`
  c1.style = titleStyle(13)

  const r2 = ws.addRow(Array(8).fill(''))
  r2.height = 22
  ws.mergeCells('A2:H2')
  const c2 = ws.getCell('A2')
  c2.value = `${sinifGoster} — ${ders.toUpperCase()} DERSİ ÜNİTELENDİRİLMİŞ YILLIK PLANI`
  c2.style = titleStyle(11)

  // ── Header row ────────────────────────────────────────────────────────────

  const headerRow = ws.addRow([
    'AY', 'HAFTA', 'SAAT',
    'HEDEF VE KAZANIMLAR',
    'KONULAR',
    'ÖĞRENME ÖĞRETME YÖNTEM VE TEKNİKLERİ',
    'KULLANILAN EĞİTİM TEKNOLOJİLERİ, ARAÇ VE GEREÇLER',
    'DEĞERLENDİRME',
  ])
  headerRow.height = 45
  headerRow.eachCell(cell => { cell.style = headerStyle() })

  // ── Veri satırları ────────────────────────────────────────────────────────

  const DATA_START = 4
  let rowIdx = DATA_START

  // Ay birleştirme takibi
  let curMonth = ''
  let monthStart = DATA_START
  // Ünite birleştirme takibi
  let curUnite = ''
  let uniteStart = DATA_START
  // Ay içi hafta sayacı
  const weekPerMonth: Record<string, number> = {}

  function buildRows(
    items: Array<{
      baslangicTarihi: string
      tatilMi: boolean
      tatilAdi?: string
      uniteAdi?: string
      kazanim?: string
    }>
  ) {
    items.forEach((h, idx) => {
      const month = getMonthName(h.baslangicTarihi)
      weekPerMonth[month] = (weekPerMonth[month] || 0) + 1
      const weekInMonth = weekPerMonth[month]

      const konular = h.tatilMi ? (h.tatilAdi || 'TATİL') : (h.kazanim || '')
      const uniteKey = h.tatilMi ? `__tatil_${idx}` : (h.uniteAdi || `__no_${idx}`)
      const hedef = h.tatilMi ? '' : (h.uniteAdi || '')

      // Ay değişti → önceki grubu birleştir
      if (month !== curMonth) {
        if (curMonth && rowIdx > monthStart) {
          ws.mergeCells(monthStart, 1, rowIdx - 1, 1)
          // Dikey yazı stili tekrar uygula (merge sonrası)
          const ayCell = ws.getCell(monthStart, 1)
          ayCell.style = {
            ...dataStyle(true),
            alignment: { horizontal: 'center', vertical: 'middle', textRotation: 90, wrapText: false },
            font: { bold: true, size: 9, name: 'Calibri' },
          }
        }
        curMonth = month
        monthStart = rowIdx
      }

      // Ünite değişti → önceki grubu birleştir
      if (uniteKey !== curUnite) {
        if (curUnite && !curUnite.startsWith('__') && rowIdx > uniteStart) {
          ws.mergeCells(uniteStart, 4, rowIdx - 1, 4)
          const uc = ws.getCell(uniteStart, 4)
          uc.style = {
            ...dataStyle(false),
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            font: { bold: true, size: 9, name: 'Calibri' },
          }
        }
        curUnite = uniteKey
        uniteStart = rowIdx
      }

      const row = ws.addRow(['', weekInMonth, h.tatilMi ? '' : 1, hedef, konular, '', '', ''])
      row.height = h.tatilMi ? 18 : 32

      if (h.tatilMi) {
        row.eachCell((cell, col) => {
          cell.style = {
            font: { bold: true, size: 9, name: 'Calibri', color: { argb: 'FF92400E' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } },
            alignment: { horizontal: col === 1 || col === 2 || col === 3 ? 'center' : 'left', vertical: 'middle', wrapText: true },
            border,
          }
        })
        // Tatil satırını KONULAR sütunundan başlayarak birleştir
        ws.mergeCells(rowIdx, 4, rowIdx, 8)
        ws.getCell(rowIdx, 4).style = {
          font: { bold: true, size: 9, name: 'Calibri', color: { argb: 'FF92400E' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border,
        }
      } else {
        row.getCell(1).style = {
          ...dataStyle(true),
          alignment: { horizontal: 'center', vertical: 'middle', textRotation: 90, wrapText: false },
          font: { bold: true, size: 9, name: 'Calibri' },
        }
        row.getCell(2).style = dataStyle(true)
        row.getCell(3).style = dataStyle(true)
        row.getCell(4).style = { ...dataStyle(false), font: { bold: true, size: 9, name: 'Calibri' } }
        row.getCell(5).style = dataStyle(false)
        row.getCell(6).style = dataStyle(false)
        row.getCell(7).style = dataStyle(false)
        row.getCell(8).style = dataStyle(true)
      }

      rowIdx++
    })
  }

  if (entry.tip === 'meb' && entry.plan) {
    buildRows(entry.plan.haftalar)
  } else if (entry.tip === 'yukle' && entry.rows) {
    // Yüklenen planlar için hafta verilerini dönüştür
    const converted = entry.rows.map((r: ParsedRow) => ({
      baslangicTarihi: guessDate(r.ay, r.haftaNo),
      tatilMi: false,
      kazanim: r.kazanim,
    }))
    buildRows(converted)
  }

  // Son ay ve ünite grubunu birleştir
  if (curMonth && rowIdx > monthStart) {
    ws.mergeCells(monthStart, 1, rowIdx - 1, 1)
    const ayCell = ws.getCell(monthStart, 1)
    ayCell.style = {
      ...dataStyle(true),
      alignment: { horizontal: 'center', vertical: 'middle', textRotation: 90, wrapText: false },
      font: { bold: true, size: 9, name: 'Calibri' },
    }
  }
  if (curUnite && !curUnite.startsWith('__') && rowIdx > uniteStart) {
    ws.mergeCells(uniteStart, 4, rowIdx - 1, 4)
    const uc = ws.getCell(uniteStart, 4)
    uc.style = {
      ...dataStyle(false),
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      font: { bold: true, size: 9, name: 'Calibri' },
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────

  ws.addRow([])
  if (ogretmenAdi) {
    const fr = ws.addRow([`Öğretmen: ${ogretmenAdi}`])
    fr.getCell(1).font = { bold: true, size: 10, name: 'Calibri' }
  }

  // ── İndir ─────────────────────────────────────────────────────────────────

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ders}-${sinifGoster}-yillik-plan-${yil}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── WORD (HTML-to-doc) ───────────────────────────────────────────────────────

export function exportPlanToWord(entry: PlanEntry, meta: ExportMeta = {}) {
  const { ders, sinifGercek, sinif, yil } = entry
  const sinifGoster = sinifGercek || sinif
  const okulAdi = meta.okulAdi || ''
  const ogretmenAdi = meta.ogretmenAdi || ''

  const rows = buildWordRows(entry)

  const css = `
    body { font-family: Calibri, sans-serif; font-size: 9pt; margin: 1cm; }
    h1, h2 { text-align: center; color: #1e3a5f; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background-color: #2D5BE3; color: white; font-weight: bold; font-size: 9pt;
         padding: 6px 4px; border: 1px solid #6B7280; text-align: center; vertical-align: middle; }
    td { border: 1px solid #9CA3AF; padding: 4px 5px; vertical-align: middle; font-size: 9pt; }
    .ay { writing-mode: vertical-rl; transform: rotate(180deg); text-align: center;
          font-weight: bold; background: #F0F4FF; }
    .center { text-align: center; }
    .tatil { background: #FFFDE7; color: #92400E; font-weight: bold; text-align: center; }
    .hedef { font-weight: bold; text-align: center; background: #F9FAFB; }
    .footer { margin-top: 24px; font-size: 9pt; }
  `

  const tableRows = rows.map(r => {
    if (r.type === 'tatil') {
      return `<tr>
        ${r.isFirstInMonth ? `<td rowspan="${r.monthRowspan}" class="ay">${r.month}</td>` : ''}
        <td class="center">${r.weekInMonth}</td>
        <td class="center"></td>
        <td colspan="5" class="tatil">${r.konular}</td>
      </tr>`
    }
    return `<tr>
      ${r.isFirstInMonth ? `<td rowspan="${r.monthRowspan}" class="ay">${r.month}</td>` : ''}
      <td class="center">${r.weekInMonth}</td>
      <td class="center">1</td>
      ${r.isFirstInUnite ? `<td rowspan="${r.uniteRowspan}" class="hedef">${r.hedef}</td>` : ''}
      <td>${r.konular}</td>
      <td></td>
      <td></td>
      <td class="center"></td>
    </tr>`
  }).join('\n')

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><style>${css}</style></head>
    <body>
      <h1>${okulAdi ? `${okulAdi} — ` : ''}${yil} EĞİTİM ÖĞRETİM YILI</h1>
      <h2>${sinifGoster} — ${ders.toUpperCase()} DERSİ ÜNİTELENDİRİLMİŞ YILLIK PLANI</h2>
      <table>
        <thead>
          <tr>
            <th>AY</th><th>HAFTA</th><th>SAAT</th>
            <th>HEDEF VE KAZANIMLAR</th><th>KONULAR</th>
            <th>ÖĞRENME ÖĞRETME YÖNTEM VE TEKNİKLERİ</th>
            <th>KULLANILAN EĞİTİM TEKNOLOJİLERİ, ARAÇ VE GEREÇLER</th>
            <th>DEĞERLENDİRME</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${ogretmenAdi ? `<div class="footer"><strong>Öğretmen:</strong> ${ogretmenAdi}</div>` : ''}
    </body>
    </html>
  `

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ders}-${sinifGoster}-yillik-plan-${yil}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Yardımcı: Word için satır verisi hazırla ─────────────────────────────────

interface WordRow {
  type: 'normal' | 'tatil'
  month: string
  weekInMonth: number
  hedef: string
  konular: string
  isFirstInMonth: boolean
  monthRowspan: number
  isFirstInUnite: boolean
  uniteRowspan: number
}

function buildWordRows(entry: PlanEntry): WordRow[] {
  const items: Array<{
    baslangicTarihi: string
    tatilMi: boolean
    tatilAdi?: string
    uniteAdi?: string
    kazanim?: string
  }> = entry.tip === 'meb' && entry.plan
    ? entry.plan.haftalar
    : (entry.rows || []).map((r: ParsedRow) => ({
        baslangicTarihi: guessDate(r.ay, r.haftaNo),
        tatilMi: false,
        kazanim: r.kazanim,
      }))

  // İlk geçiş: ay ve ünite span'larını hesapla
  const weekPerMonth: Record<string, number> = {}
  const monthCounts: Record<string, number> = {}
  const uniteCounts: Record<string, number> = {}

  // Hangi ay/ünite grubunun kaçıncısında olduğumuzu takip et
  const monthGroups: string[] = []
  const uniteGroups: string[] = []

  items.forEach((h, idx) => {
    const month = getMonthName(h.baslangicTarihi)
    const uniteKey = h.tatilMi ? `__tatil_${idx}` : (h.uniteAdi || `__no_${idx}`)
    monthGroups.push(month)
    uniteGroups.push(uniteKey)
    monthCounts[month] = (monthCounts[month] || 0) + 1
    if (!h.tatilMi && h.uniteAdi) {
      uniteCounts[uniteKey] = (uniteCounts[uniteKey] || 0) + 1
    }
  })

  const seenMonths = new Set<string>()
  const seenUnites = new Set<string>()

  return items.map((h, idx) => {
    const month = monthGroups[idx]
    const uniteKey = uniteGroups[idx]

    weekPerMonth[month] = (weekPerMonth[month] || 0) + 1
    const weekInMonth = weekPerMonth[month]

    const isFirstInMonth = !seenMonths.has(month)
    if (isFirstInMonth) seenMonths.add(month)

    const isFirstInUnite = !h.tatilMi && !!h.uniteAdi && !seenUnites.has(uniteKey)
    if (isFirstInUnite) seenUnites.add(uniteKey)

    return {
      type: h.tatilMi ? 'tatil' : 'normal',
      month,
      weekInMonth,
      hedef: h.uniteAdi || '',
      konular: h.tatilMi ? (h.tatilAdi || 'TATİL') : (h.kazanim || ''),
      isFirstInMonth,
      monthRowspan: monthCounts[month] || 1,
      isFirstInUnite,
      uniteRowspan: h.uniteAdi ? (uniteCounts[uniteKey] || 1) : 1,
    } as WordRow
  })
}

// ─── Yardımcı: Yüklenen planlar için tahmini tarih ───────────────────────────

function guessDate(ay: string, _haftaNo: number): string {
  const ayMap: Record<string, number> = {
    'eylül': 9, 'ekim': 10, 'kasım': 11, 'aralık': 12,
    'ocak': 1, 'şubat': 2, 'mart': 3, 'nisan': 4,
    'mayıs': 5, 'haziran': 6,
  }
  const monthNum = ayMap[(ay || '').toLowerCase()] || 9
  const year = monthNum >= 9 ? 2025 : 2026
  return `${year}-${String(monthNum).padStart(2, '0')}-01`
}
