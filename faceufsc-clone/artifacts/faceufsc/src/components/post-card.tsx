import { useState } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  useListComments,
  getListCommentsQueryKey,
  useCreateComment,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import type { Post } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export function PostCard({ post, communityId }: { post: Post; communityId?: number }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading: commentsLoading } = useListComments(post.id, {
    query: {
      queryKey: getListCommentsQueryKey(post.id),
      enabled: commentsOpen,
    },
  });

  const createComment = useCreateComment();

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    createComment.mutate(
      { id: post.id, data: { content: commentText.trim() } },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(post.id) });
          // Refresh post list to update commentsCount badge
          if (communityId != null) {
            queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({ communityId }) });
          } else {
            queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({}) });
          }
        },
        onError: () => toast({ title: "Erro ao comentar", variant: "destructive" }),
      }
    );
  }

  return (
    <Card className="border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Link href={`/profile/${post.authorId}`}>
          <Avatar className="h-10 w-10 border border-border cursor-pointer hover:opacity-80 transition-opacity">
            {post.authorAvatarUrl && (
              <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} className="object-cover" />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(post.authorName)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <Link href={`/profile/${post.authorId}`}>
              <span className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer transition-colors">
                {post.authorName}
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              {format(new Date(post.createdAt), "d MMM, HH:mm")}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {post.authorCourse}
            {post.communityName && ` • em ${post.communityName}`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
      </CardContent>

      <CardFooter className="flex justify-between border-t bg-muted/20 py-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
          <Heart className="mr-2 h-4 w-4" />
          {post.likesCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full transition-colors ${
            commentsOpen
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setCommentsOpen(v => !v)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {post.commentsCount}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </CardFooter>

      {commentsOpen && (
        <div className="border-t bg-muted/10 px-5 py-4 space-y-4">
          {/* List of existing comments */}
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            <div className="space-y-3">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/profile/${comment.authorId}`}>
                    <Avatar className="h-8 w-8 border cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                      {comment.authorAvatarUrl && (
                        <AvatarImage
                          src={comment.authorAvatarUrl}
                          alt={comment.authorName}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials(comment.authorName)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 bg-card rounded-xl px-3 py-2 border border-primary/10">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/profile/${comment.authorId}`}>
                        <span className="text-sm font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                          {comment.authorName}
                        </span>
                      </Link>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {comment.authorCourse}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(comment.createdAt), "d MMM")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New comment input */}
          {user && (
            <div className="flex gap-3 pt-2 border-t border-primary/10">
              <Avatar className="h-8 w-8 border flex-shrink-0">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                )}
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Escreva um comentário... (Enter para enviar)"
                  className="flex-1 min-h-[60px] resize-none text-sm border-primary/20 focus-visible:ring-primary"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-9 w-9 self-end bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createComment.isPending}
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
