import { describe, it, expect } from 'vitest'
import subject from '../../../../app/scripts/lib/background/tabs.js'

describe('export', () => {
  it('should exist', () => {
    expect(subject).toBeTypeOf('function')
  })
})
