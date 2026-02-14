import { auth } from '@config/firebase';
import { getBackendURL } from '@config/features';

interface TransactionPayload {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  isRecurring: boolean;
  status: 'paid' | 'pending';
  userId: string;
}

export const processTransaction = async (payload: TransactionPayload) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user authenticated');

  const idToken = await user.getIdToken();
  const baseUrl = getBackendURL();

  const response = await fetch(`${baseUrl}/api/v1/finance/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || 'Failed to process transaction');
  }

  return response.json();
};
