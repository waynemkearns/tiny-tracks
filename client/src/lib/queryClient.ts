import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      retry: false,
    },
  },
});

// Set up React Query persistence
if (typeof window !== 'undefined') {
  const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'TINY_TRACKS_QUERY_CACHE',
    throttleTime: 1000, // 1 second
  });

  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: '1.0', // Update this when cache format changes
    hydrateOptions: {
      // When true, stale queries will refetch in the background on app startup
      defaultOptions: {
        queries: {
          refetchOnMount: true,
        },
      },
    },
  });
}
