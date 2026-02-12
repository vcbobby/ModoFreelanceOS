import { auth } from '@config/firebase';

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
