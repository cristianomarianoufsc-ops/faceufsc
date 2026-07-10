import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, FileText, Send, MessageCircle, Heart, Share2, Globe, BookOpen, FlaskConical, Activity, Music, Home, Building2, ChevronRight, ArrowLeft, Layers } from "lucide-react";
import { 
  useGetCommunity, 
  getGetCommunityQueryKey,
  useListPosts,
  getListPostsQueryKey,
  useCreatePost,
  useJoinCommunity,
  useListCommunities,
  getListCommunitiesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";

const postSchema = z.object({
  content: z.string().min(1, "A publicacao nao pode estar vazia"),
});

const categoryIcons: Record<string, any> = {
  campus: Building2,
  center: Layers,
  course: BookOpen,
  research: FlaskConical,
  sports: Activity,
  culture: Music,
  housing: Home,
  general: Globe,
};

const categoryLabels: Record<string, string> = {
  campus: "Campus",
  center: "Centro",
  course: "Curso",
  research: "Pesquisa",
  sports: "Esportes",
  culture: "Cultura",
  housing: "Moradia",
  general: "Geral",
};

const subCommunityLabel: Record<string, string> = {
  campus: "Centros deste Campus",
  center: "Cursos deste Centro",
  course: "Comunidades",
  general: "Sub-comunidades",
};

export default function CommunityDetail() {
  const [, params] = useRoute("/communities/:id");
  const [, setLocation] = useLocation();
  const communityId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: community, isLoading: communityLoading } = useGetCommunity(communityId, {
    query: { enabled: !!communityId, queryKey: getGetCommunityQueryKey(communityId) }
  });

  const { data: posts, isLoading: postsLoading } = useListPosts(
    { communityId },
    { query: { enabled: !!communityId, queryKey: getListPostsQueryKey({ communityId }) } }
  );

  const { data: subCommunities, isLoading: subLoading } = useListCommunities(
    { parentId: communityId },
    { query: { enabled: !!communityId, queryKey: getListCommunitiesQueryKey({ parentId: communityId }) } }
  );

  const createPost = useCreatePost();
  const joinCommunity = useJoinCommunity();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    createPost.mutate(
      { data: { content: values.content, authorId: user?.id ?? 1, communityId } },
      {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({ communityId }) });
          toast({ title: "Publicação criada", description: "Sua publicação foi compartilhada na comunidade." });
        },
      }
    );
  }

  function handleJoin() {
    joinCommunity.mutate(
      { id: communityId, data: { userId: user?.id ?? 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCommunityQueryKey(communityId) });
          toast({ title: "Participando!", description: "Você agora é membro desta comunidade." });
        },
      }
    );
  }

  if (communityLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div><Skeleton className="h-64 w-full" /></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) return <Layout><div className="text-center py-20">Comunidade não encontrada</div></Layout>;

  const Icon = categoryIcons[community.category] || Globe;
  const hasSubCommunities = (community.childrenCount ?? 0) > 0 || (subCommunities && subCommunities.length > 0);
  const subLabel = subCommunityLabel[community.category] ?? "Sub-comunidades";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => setLocation("/communities")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Comunidades
        </Button>

        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl text-primary-foreground p-8 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Icon className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none px-3 py-1 uppercase tracking-widest text-xs font-bold">
                {categoryLabels[community.category] ?? community.category}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{community.name}</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl leading-relaxed mb-8">
              {community.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4 text-secondary" /> {community.membersCount} Membros
              </div>
              <div className="flex items-center gap-1.5 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                <FileText className="h-4 w-4 text-secondary" /> {community.postsCount} Publicações
              </div>
              {hasSubCommunities && (
                <div className="flex items-center gap-1.5 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                  <Layers className="h-4 w-4 text-secondary" /> {subCommunities?.length ?? community.childrenCount} {subLabel}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="md:col-span-2 space-y-6">

            {/* Sub-communities section */}
            {hasSubCommunities && (
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    {subLabel}
                  </h3>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {subLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {subCommunities?.map((sub) => {
                        const SubIcon = categoryIcons[sub.category] || Globe;
                        return (
                          <button
                            key={sub.id}
                            className="w-full flex items-center gap-4 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                            onClick={() => setLocation(`/communities/${sub.id}`)}
                          >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <SubIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {sub.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {sub.membersCount} membros · {sub.postsCount} publicações
                                {(sub.childrenCount ?? 0) > 0 && ` · ${sub.childrenCount} sub-comunidades`}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Post creation */}
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 border border-border hidden sm:block">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                          {user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Textarea 
                                placeholder={`Publique algo em ${community.name}...`}
                                className="min-h-[100px] resize-none border-primary/20 focus-visible:ring-primary"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        type="submit" 
                        disabled={createPost.isPending || !form.watch("content")}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
                      >
                        {createPost.isPending ? "Publicando..." : "Publicar"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Posts feed */}
            <div className="space-y-6">
              {postsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : posts?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                  Nenhuma publicação ainda. Seja o primeiro a compartilhar algo!
                </div>
              ) : (
                posts?.map((post) => (
                  <Card key={post.id} className="border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start gap-4 pb-4">
                      <Avatar className="h-10 w-10 border border-border">
                        {post.authorAvatarUrl ? (
                          <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {post.authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <span className="font-semibold text-foreground hover:underline cursor-pointer">
                            {post.authorName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{post.authorCourse}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 py-3">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
                        <Heart className="mr-2 h-4 w-4" /> {post.likesCount}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
                        <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
                        <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-primary/10 sticky top-24">
              <CardHeader>
                <h3 className="font-bold text-lg">Sobre a Comunidade</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Criada em {format(new Date(community.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                {community.parentId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-primary"
                    onClick={() => setLocation(`/communities/${community.parentId}`)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ver comunidade pai
                  </Button>
                )}
                <Button 
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                  size="lg"
                  onClick={handleJoin}
                  disabled={joinCommunity.isPending}
                >
                  {joinCommunity.isPending ? "Entrando..." : "Participar da Comunidade"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
