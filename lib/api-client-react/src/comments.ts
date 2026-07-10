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

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  authorCourse: string;
  content: string;
  createdAt: string;
}

export interface CommentInput {
  content: string;
}

const listComments = (postId: number): Promise<Comment[]> =>
  customFetch<Comment[]>(`/api/posts/${postId}/comments`, { method: 'GET' });

const createComment = (postId: number, data: CommentInput): Promise<Comment> =>
  customFetch<Comment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const getListCommentsQueryKey = (postId: number): QueryKey =>
  ['posts', postId, 'comments'];

export const useListComments = <TData = Comment[], TError = ErrorType<unknown>>(
  postId: number,
  options?: { query?: UseQueryOptions<Comment[], TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getListCommentsQueryKey(postId);
  const queryFn: QueryFunction<Comment[]> = () => listComments(postId);
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: postId !== null && postId !== undefined,
    ...queryOptions,
  }) as UseQueryResult<TData, TError>;
  return Object.assign(query, { queryKey });
};

export const useCreateComment = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: UseMutationOptions<Comment, TError, { id: number; data: CommentInput }, TContext>
): UseMutationResult<Comment, TError, { id: number; data: CommentInput }, TContext> => {
  const mutationFn: MutationFunction<Comment, { id: number; data: CommentInput }> = ({ id, data }) =>
    createComment(id, data);
  return useMutation({ mutationFn, ...options });
};
