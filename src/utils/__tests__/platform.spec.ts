import { vi, describe, it, expect, afterEach } from 'vitest'

const loadModule = async (mockCapacitor: any, win?: any) => {
    vi.doMock('@capacitor/core', () => ({ Capacitor: mockCapacitor }))
    // Aseguramos que 'window' existe en environment 'node'
    // @ts-ignore
    global.window = win !== undefined ? win : {}
    // Import dinámico para que las constantes del módulo se evalúen con los mocks
    return await import('../platform')
}

describe('getPlatform util', () => {
    afterEach(() => {
        vi.resetModules()
        // @ts-ignore
        delete (global as any).window
    })

    it('returns windows when electron present on window', async () => {
        const mod = await loadModule(
            { isNativePlatform: () => false, getPlatform: () => 'web' },
            { electron: {} },
        )
        expect(mod.getPlatform()).toBe('windows')
    })

    it('returns android when Capacitor reports android', async () => {
        const mod = await loadModule({
            isNativePlatform: () => true,
            getPlatform: () => 'android',
        })
        expect(mod.getPlatform()).toBe('android')
    })

    it('returns web by default', async () => {
        const mod = await loadModule({
            isNativePlatform: () => false,
            getPlatform: () => 'web',
        })
        expect(mod.getPlatform()).toBe('web')
    })
})
