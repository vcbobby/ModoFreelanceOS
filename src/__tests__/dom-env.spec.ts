import { it, expect } from 'vitest'

it('has document body in jsdom', () => {
    expect(document.body).not.toBeNull()
})
