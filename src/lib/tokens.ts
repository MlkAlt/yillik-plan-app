/**
 * tokens.ts — v6 Design Token'ları (JS Sabitleri)
 *
 * Kullanım:
 *   import { tokens } from '@/lib/tokens'
 *   const bg = isDark ? tokens.color.dark.bg : tokens.color.light.bg
 *
 * CSS token'larının JS karşılığı — inline stil ve hesaplamalar için.
 * Tailwind class'larını tercih et; sadece dinamik/hesaplamalı durumlarda bunu kullan.
 */

export const tokens = {
  color: {
    // Brand — tema bağımsız sabit renkler
    brand: {
      primary:   '#4F6AF5',
      primaryS:  '#f0f4ff',
      primaryB:  '#c7d2fe',
      primaryD:  '#1e2a78',
      success:   '#10b981',
      successS:  '#ecfdf5',
      successB:  '#d1fae5',
      warning:   '#f59e0b',
      warningS:  '#fffbeb',
      warningB:  '#fde68a',
      danger:    '#f43f5e',
      dangerS:   '#fff1f2',
      accent:    '#7c3aed',
      accentS:   '#f5f3ff',
    },

    // Semantic — tema bazlı (light)
    light: {
      bg:       '#f5f5f2',
      bg2:      '#ededea',
      surface:  '#ffffff',
      surface2: '#fafaf8',
      border:   '#e6e6e3',
      border2:  '#d4d4d0',
      text1:    '#0f0f0e',
      text2:    '#5f5f5d',
      text3:    '#a0a09e',
      navBg:    '#ffffff',
      inputBg:  '#ffffff',
    },

    // Semantic — tema bazlı (dark)
    dark: {
      bg:       '#111113',
      bg2:      '#1a1a1d',
      surface:  '#1e1e22',
      surface2: '#252529',
      border:   '#2e2e34',
      border2:  '#3c3c44',
      text1:    '#f0f0ee',
      text2:    '#86868a',
      text3:    '#52525a',
      navBg:    '#1e1e22',
      inputBg:  '#252529',
    },
  },

  radius: {
    sm:   '4px',
    md:   '12px',
    lg:   '16px',
    xl:   '20px',
    '2xl': '24px',
    pill: '100px',
  },

  shadow: {
    // Light tema gölgeleri
    light: {
      xs: '0 1px 3px rgba(0,0,0,.05)',
      sm: '0 2px 8px rgba(0,0,0,.07)',
      md: '0 4px 16px rgba(0,0,0,.09)',
    },
    // Dark tema gölgeleri
    dark: {
      xs: '0 1px 3px rgba(0,0,0,.30)',
      sm: '0 2px 8px rgba(0,0,0,.40)',
      md: '0 4px 16px rgba(0,0,0,.50)',
    },
  },

  font: {
    ui:      "'Sora', sans-serif",
    display: "'Outfit', sans-serif",
  },
} as const

export type Tokens = typeof tokens
