import { BackendError, createBackendClient } from '@/services/backend/backendClient';

describe('backendClient', () => {
  it('returns parsed JSON response', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"ok":true}'),
    });

    const client = createBackendClient({
      baseURL: 'http://localhost',
      fetchFn,
      maxRetries: 0,
    });

    const result = await client.get<{ ok: boolean }>('/health');
    expect(result.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('retries on network error', async () => {
    vi.useFakeTimers();

    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network'))
      .mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"ok":true}'),
      });

    const client = createBackendClient({
      baseURL: 'http://localhost',
      fetchFn,
      maxRetries: 1,
      timeoutMs: 10,
    });

    const promise = client.get<{ ok: boolean }>('/health');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('throws BackendError for 4xx', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    const client = createBackendClient({
      baseURL: 'http://localhost',
      fetchFn,
      maxRetries: 1,
    });

    await expect(client.get('/bad')).rejects.toBeInstanceOf(BackendError);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
