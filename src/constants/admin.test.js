import { describe, expect, it } from 'vitest'
import { isMagariAdminEmail, MAGARI_ADMIN_EMAIL } from './admin.js'

describe('isMagariAdminEmail', () => {
  it('matches configured admin email case-insensitively', () => {
    expect(isMagariAdminEmail(MAGARI_ADMIN_EMAIL)).toBe(true)
    expect(isMagariAdminEmail(MAGARI_ADMIN_EMAIL.toUpperCase())).toBe(true)
  })

  it('rejects other emails', () => {
    expect(isMagariAdminEmail('other@example.com')).toBe(false)
    expect(isMagariAdminEmail('')).toBe(false)
  })
})
