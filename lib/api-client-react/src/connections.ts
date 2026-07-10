import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { customFetch } from './custom-fetch';
import type { ErrorType } from './custom-fetch';

export interface Connection {
  id: number;
  requesterId: number;
  receiverId: number;
  status: 'pending' | 'accepted';
  requesterName: string;
  requesterAvatarUrl?: string | null;
  requesterCourse: string;
  receiverName: string;
  receiverAvatarUrl?: string | null;
  receiverCourse: string;
  createdAt: string;
}

export interface ConnectionStatus {
  status: 'none' | 'connected' | 'pending_sent' | 'pending_received';
  connectionId: number | null;
}

export interface SendConnectionInput {
  receiverId: number;
}

export interface UpdateConnectionInput {
  action: 'accept' | 'reject';
}

// ── List accepted connections ──────────────────────────────────────────────
const listConnections = (): Promise<Connection[]> =>
  customFetch<Connection[]>('/api/connections', { method: 'GET' });

export const getListConnectionsQueryKey = (): QueryKey => ['connections'];

export const useListConnections = <TData = Connection[], TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Connection[], TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getListConnectionsQueryKey();
  const queryFn: QueryFunction<Connection[]> = () => listConnections();
  const query = useQuery({ queryKey, queryFn, ...queryOptions }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

// ── List pending requests received ────────────────────────────────────────
const listConnectionRequests = (): Promise<Connection[]> =>
  customFetch<Connection[]>('/api/connections/requests', { method: 'GET' });

export const getListConnectionRequestsQueryKey = (): QueryKey => ['connections', 'requests'];

export const useListConnectionRequests = <TData = Connection[], TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Connection[], TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getListConnectionRequestsQueryKey();
  const queryFn: QueryFunction<Connection[]> = () => listConnectionRequests();
  const query = useQuery({ queryKey, queryFn, ...queryOptions }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

// ── Get connection status with a specific user ────────────────────────────
const getConnectionStatus = (userId: number): Promise<ConnectionStatus> =>
  customFetch<ConnectionStatus>(`/api/connections/status/${userId}`, { method: 'GET' });

export const getGetConnectionStatusQueryKey = (userId: number): QueryKey => [
  'connections',
  'status',
  userId,
];

export const useGetConnectionStatus = <TData = ConnectionStatus, TError = ErrorType<unknown>>(
  userId: number,
  options?: { query?: UseQueryOptions<ConnectionStatus, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getGetConnectionStatusQueryKey(userId);
  const queryFn: QueryFunction<ConnectionStatus> = () => getConnectionStatus(userId);
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: userId !== null && userId !== undefined,
    ...queryOptions,
  }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

// ── Send connection request ────────────────────────────────────────────────
const sendConnectionRequest = (data: SendConnectionInput): Promise<Connection> =>
  customFetch<Connection>('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const useSendConnectionRequest = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<Connection, TError, SendConnectionInput, TContext>
): UseMutationResult<Connection, TError, SendConnectionInput, TContext> => {
  const mutationFn: MutationFunction<Connection, SendConnectionInput> = (data) =>
    sendConnectionRequest(data);
  return useMutation({ mutationFn, ...options });
};

// ── Accept / reject a connection ──────────────────────────────────────────
const updateConnection = (id: number, data: UpdateConnectionInput): Promise<void> =>
  customFetch<void>(`/api/connections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const useUpdateConnection = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<void, TError, { id: number; data: UpdateConnectionInput }, TContext>
): UseMutationResult<void, TError, { id: number; data: UpdateConnectionInput }, TContext> => {
  const mutationFn: MutationFunction<void, { id: number; data: UpdateConnectionInput }> = ({
    id,
    data,
  }) => updateConnection(id, data);
  return useMutation({ mutationFn, ...options });
};

// ── Delete / cancel a connection ──────────────────────────────────────────
const deleteConnection = (id: number): Promise<void> =>
  customFetch<void>(`/api/connections/${id}`, { method: 'DELETE' });

export const useDeleteConnection = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<void, TError, number, TContext>
): UseMutationResult<void, TError, number, TContext> => {
  const mutationFn: MutationFunction<void, number> = (id) => deleteConnection(id);
  return useMutation({ mutationFn, ...options });
};
