import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

export interface ParsedRow {
    haftaNo: number
    ay: string
    donem: string
    tarihAraligi: string
    kazanim: string
}

// Şablondan Excel parse et (Ay, HaftaNo, Dönem, TarihAralığı, Kazanım)
export async function parseExcel(file: File): Promise<ParsedRow[]> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

    const result: ParsedRow[] = []

    for (const row of rows) {
        if (!Array.isArray(row) || row.length < 5) continue

        const col1 = String(row[0] ?? '').trim()
        const col2 = String(row[1] ?? '').trim()
        const col3 = String(row[2] ?? '').trim()
        const col4 = String(row[3] ?? '').trim()
        const col5 = String(row[4] ?? '').trim()

        const haftaNo = parseInt(col2, 10)

        // Geçerli veri satırı: 2. sütun sayı olmalı
        if (isNaN(haftaNo)) continue
        // Kazanım boşsa atla
        if (!col5) continue

        result.push({
            haftaNo,
            ay: col1,
            donem: col3,
            tarihAraligi: col4,
            kazanim: col5,
        })
    }

    return result
}

// Word dosyasını parse et
export async function parseWord(file: File): Promise<ParsedRow[]> {
    const buffer = await file.arrayBuffer()
    const { value: text } = await mammoth.extractRawText({ arrayBuffer: buffer })

    const result: ParsedRow[] = []
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

    for (const line of lines) {
        const match = line.match(/^(\d+)[\.\s]+(.+)/)
        if (match) {
            result.push({
                haftaNo: parseInt(match[1], 10),
                ay: '',
                donem: '',
                tarihAraligi: '',
                kazanim: match[2].trim(),
            })
        }
    }

    return result
}

export async function parseFile(file: File): Promise<ParsedRow[]> {
    const name = file.name.toLowerCase()
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        return parseExcel(file)
    }
    if (name.endsWith('.docx')) {
        return parseWord(file)
    }
    throw new Error('Desteklenmeyen dosya formatı (.xlsx, .xls veya .docx olmalı)')
}