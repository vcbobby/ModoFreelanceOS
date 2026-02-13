export const runWithCredits = async <T>(
  cost: number,
  onUsage: (cost?: number) => Promise<boolean>,
  task: () => Promise<T>
): Promise<{ ok: boolean; result?: T }> => {
  const canProceed = await onUsage(cost);
  if (!canProceed) return { ok: false };

  try {
    const result = await task();
    return { ok: true, result };
  } catch (error) {
    await onUsage(-cost);
    throw error;
  }
};
