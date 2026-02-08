import { createGeminiClient } from '@/services/gemini/geminiClient';

describe('geminiClient', () => {
  it('throws when api key is missing', async () => {
    const client = createGeminiClient({ apiKey: '' });
    await expect(client.analyzeDocument('text', 'resumen')).rejects.toThrow(
      'Gemini no está configurado'
    );
  });
});
