import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query/react';
import { getBackendURL, shouldUseBackendV2 } from '@config/features';
import { auth } from '@config/firebase';

interface CheckStatusRequest {
  platform: string;
  userId: string;
}

interface CheckStatusResponse {
  data: {
    isSubscribed?: boolean;
    credits?: number;
    subscriptionEnd?: number;
    lastReset?: number;
  };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBackendURL(),
});

const baseQueryWithTimeout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const headers = new Headers(typeof args === 'string' ? undefined : (args.headers as any));
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // Ignore auth header failures; backend will reject if required.
  }

  const requestArgs =
    typeof args === 'string'
      ? { url: args, signal: controller.signal, headers }
      : { ...args, signal: controller.signal, headers };

  const result = await rawBaseQuery(requestArgs, api, extraOptions);
  clearTimeout(timeoutId);
  return result;
};

const baseQueryWithRetry = retry(baseQueryWithTimeout, { maxRetries: 2 });

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: baseQueryWithRetry,
  endpoints: (builder) => ({
    checkStatus: builder.mutation<CheckStatusResponse, CheckStatusRequest>({
      query: ({ platform, userId }) => {
        const formData = new FormData();
        formData.append('platform', platform);
        formData.append('userId', userId);
        const statusPath = shouldUseBackendV2()
          ? '/api/v1/users/check-status'
          : '/api/check-status';
        return {
          url: statusPath,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useCheckStatusMutation } = backendApi;
export type { CheckStatusResponse };
