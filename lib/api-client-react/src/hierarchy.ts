/**
 * Handwritten hooks for hierarchical community navigation.
 * These complement the orval-generated api.ts.
 */
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { customFetch } from './custom-fetch';
import type { ErrorType } from './custom-fetch';
import type { Community } from './generated/api.schemas';

// ── GET /api/communities/:id/children ────────────────────────────────────────

export const getGetCommunityChildrenUrl = (id: number) => `/api/communities/${id}/children`;

export const getCommunityChildren = async (id: number, options?: RequestInit): Promise<Community[]> =>
  customFetch<Community[]>(getGetCommunityChildrenUrl(id), { ...options, method: 'GET' });

export const getGetCommunityChildrenQueryKey = (id: number) =>
  [`/api/communities/${id}/children`] as const;

export const getGetCommunityChildrenQueryOptions = <
  TData = Awaited<ReturnType<typeof getCommunityChildren>>,
  TError = ErrorType<unknown>
>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getCommunityChildren>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetCommunityChildrenQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getCommunityChildren(id, { signal });
  return { queryKey, queryFn, enabled: !!id, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getCommunityChildren>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export function useGetCommunityChildren<
  TData = Awaited<ReturnType<typeof getCommunityChildren>>,
  TError = ErrorType<unknown>
>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getCommunityChildren>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetCommunityChildrenQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryOptions.queryKey;
  return query;
}
