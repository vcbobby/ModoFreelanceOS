import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query/react';
import { getBackendURL } from '@config/features';

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

  const requestArgs =
    typeof args === 'string'
      ? { url: args, signal: controller.signal }
      : { ...args, signal: controller.signal };

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
        return {
          url: '/api/check-status',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useCheckStatusMutation } = backendApi;
export type { CheckStatusResponse };
