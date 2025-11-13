import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../../../app/scripts/lib/utils.js'

describe('escapeHtml', () => {
  it('escapes script tags to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script>'
    const escaped = escapeHtml(malicious)
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    expect(escaped).not.toContain('<script>')
  })

  it('escapes HTML special characters', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('"quotes"')).toBe('"quotes"') // textContent doesn't escape quotes
  })

  it('handles null and undefined', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('preserves safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
    expect(escapeHtml('Tab Title 123')).toBe('Tab Title 123')
  })

  it('escapes malicious tab titles that could break HTML', () => {
    // Real-world scenario: tab title contains HTML
    const tabTitle = 'My Page <img src=x onerror=alert(1)>'
    const escaped = escapeHtml(tabTitle)
    expect(escaped).not.toContain('<img')
    expect(escaped).toContain('&lt;img')
  })
})

