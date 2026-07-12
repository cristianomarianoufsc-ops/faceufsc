import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { customFetch } from './custom-fetch';
import type { ErrorType } from './custom-fetch';

export interface ForumTopic {
  id: number;
  communityId: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  repliesCount: number;
  createdAt: string;
}

export interface ForumReply {
  id: number;
  topicId: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface ForumTopicWithReplies extends ForumTopic {
  replies: ForumReply[];
}

export interface CreateTopicInput {
  title: string;
  content: string;
}

export interface CreateReplyInput {
  content: string;
}

const listTopics = (communityId: number): Promise<ForumTopic[]> =>
  customFetch<ForumTopic[]>(`/api/communities/${communityId}/topics`, { method: 'GET' });

const getTopic = (topicId: number): Promise<ForumTopicWithReplies> =>
  customFetch<ForumTopicWithReplies>(`/api/forum/topics/${topicId}`, { method: 'GET' });

const createTopic = (communityId: number, data: CreateTopicInput): Promise<ForumTopic> =>
  customFetch<ForumTopic>(`/api/communities/${communityId}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

const createReply = (topicId: number, data: CreateReplyInput): Promise<ForumReply> =>
  customFetch<ForumReply>(`/api/forum/topics/${topicId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const getListTopicsQueryKey = (communityId: number): QueryKey =>
  ['communities', communityId, 'topics'];

export const getTopicQueryKey = (topicId: number): QueryKey =>
  ['forum', 'topics', topicId];

export const useListTopics = <TData = ForumTopic[], TError = ErrorType<unknown>>(
  communityId: number,
  options?: { query?: UseQueryOptions<ForumTopic[], TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryKey = options?.query?.queryKey ?? getListTopicsQueryKey(communityId);
  const query = useQuery({
    queryKey,
    queryFn: () => listTopics(communityId),
    enabled: !!communityId,
    ...options?.query,
  }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

export const useGetTopic = <TData = ForumTopicWithReplies, TError = ErrorType<unknown>>(
  topicId: number,
  options?: { query?: UseQueryOptions<ForumTopicWithReplies, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryKey = options?.query?.queryKey ?? getTopicQueryKey(topicId);
  const query = useQuery({
    queryKey,
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
    ...options?.query,
  }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

export const useCreateTopic = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<ForumTopic, TError, { communityId: number; data: CreateTopicInput }, TContext>
): UseMutationResult<ForumTopic, TError, { communityId: number; data: CreateTopicInput }, TContext> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, data }) => createTopic(communityId, data),
    onSuccess: (_, { communityId }) => {
      qc.invalidateQueries({ queryKey: getListTopicsQueryKey(communityId) });
    },
    ...options,
  });
};

export const useCreateReply = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<ForumReply, TError, { topicId: number; communityId: number; data: CreateReplyInput }, TContext>
): UseMutationResult<ForumReply, TError, { topicId: number; communityId: number; data: CreateReplyInput }, TContext> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, data }) => createReply(topicId, data),
    onSuccess: (_, { topicId, communityId }) => {
      qc.invalidateQueries({ queryKey: getTopicQueryKey(topicId) });
      qc.invalidateQueries({ queryKey: getListTopicsQueryKey(communityId) });
    },
    ...options,
  });
};
