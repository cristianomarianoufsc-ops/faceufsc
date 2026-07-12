import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, MessageCircle, Pin, Send, ArrowLeft } from "lucide-react";
import {
  useGetTopic,
  useCreateReply,
  useGetCommunity,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function timeAgo(iso: string) {
  return format(new Date(iso), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
}

export default function ForumTopicPage() {
  const [, params] = useRoute("/forum/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  const topicId = parseInt(params?.id ?? "0");

  const { data: topic, isLoading } = useGetTopic(topicId);
  const { data: community } = useGetCommunity(
    topic?.communityId?.toString() ?? "0",
    { query: { enabled: !!topic?.communityId } }
  );

  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createReply = useCreateReply({
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["forum", "topics", topicId] });
      toast({ title: "Resposta enviada!" });
    },
    onError: () => toast({ title: "Erro ao enviar resposta", variant: "destructive" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    createReply.mutate(
      { topicId, communityId: topic!.communityId, data: { content: replyText } },
      { onSettled: () => setSubmitting(false) }
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto text-center py-20 text-muted-foreground">
          Tópico não encontrado.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <button onClick={() => setLocation("/communities")} className="hover:text-primary transition-colors hover:underline">
            Comunidades
          </button>
          {community && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <button
                onClick={() => setLocation(`/communities/${community.id}`)}
                className="hover:text-primary transition-colors hover:underline"
              >
                {community.name}
              </button>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px]">Fórum</span>
        </nav>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => community ? setLocation(`/communities/${community.id}`) : history.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a comunidade
        </Button>

        {/* Topic header */}
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-2">
              {topic.isPinned && (
                <Badge variant="secondary" className="gap-1 shrink-0 mt-0.5">
                  <Pin className="h-3 w-3" /> Fixado
                </Badge>
              )}
              <h1 className="text-xl font-bold leading-snug">{topic.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-border shrink-0">
                {topic.authorAvatarUrl ? <AvatarImage src={topic.authorAvatarUrl} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials(topic.authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{topic.authorName}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(topic.createdAt)}</p>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{topic.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MessageCircle className="h-4 w-4" />
            {topic.repliesCount === 0
              ? "Nenhuma resposta ainda — seja o primeiro!"
              : `${topic.repliesCount} resposta${topic.repliesCount !== 1 ? "s" : ""}`}
          </div>

          {(topic.replies ?? []).map((reply, i) => (
            <Card key={reply.id} className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7 border border-border shrink-0">
                    {reply.authorAvatarUrl ? <AvatarImage src={reply.authorAvatarUrl} /> : null}
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                      {initials(reply.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{reply.authorName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground/60">#{i + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-9">
                  {reply.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply box */}
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Sua resposta</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 border border-border shrink-0 hidden sm:block">
                  {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {user ? initials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Escreva sua resposta..."
                  className="min-h-[100px] resize-none border-primary/20 focus-visible:ring-primary text-sm flex-1"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!replyText.trim() || submitting}
                  className="gap-2"
                  size="sm"
                >
                  <Send className="h-4 w-4" /> Responder
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
