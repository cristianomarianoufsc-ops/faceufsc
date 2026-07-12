import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users, FileText, Send, MessageCircle, Heart, Share2,
  Globe, BookOpen, FlaskConical, Activity, Music, Home,
  Building2, ChevronRight, ArrowLeft, Layers, CheckCircle2,
  CalendarDays, Info, Hash, MessageSquare, Plus, Pin,
} from "lucide-react";
import {
  useGetCommunity,
  getGetCommunityQueryKey,
  useListPosts,
  getListPostsQueryKey,
  useCreatePost,
  useJoinCommunity,
  useListCommunities,
  getListCommunitiesQueryKey,
  useListTopics,
  useCreateTopic,
  type ForumTopic,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getCampusImage } from "@/data/campus-images";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const postSchema = z.object({
  content: z.string().min(1, "A publicação não pode estar vazia"),
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

const subTabLabel: Record<string, string> = {
  campus: "Centros",
  center: "Cursos",
  course: "Sub-comunidades",
  general: "Sub-comunidades",
};

const categoryColors: Record<string, string> = {
  campus:   "from-blue-700 to-blue-900",
  center:   "from-indigo-600 to-indigo-900",
  course:   "from-primary to-primary/80",
  research: "from-violet-700 to-violet-900",
  sports:   "from-orange-600 to-orange-800",
  culture:  "from-pink-600 to-pink-800",
  housing:  "from-teal-600 to-teal-800",
  general:  "from-slate-600 to-slate-800",
};

export default function CommunityDetail() {
  const [, params] = useRoute("/communities/:id");
  const [, setLocation] = useLocation();
  const communityId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [joined, setJoined] = useState(false);

  const { data: community, isLoading: communityLoading } = useGetCommunity(communityId, {
    query: { enabled: !!communityId, queryKey: getGetCommunityQueryKey(communityId) },
  });

  // Fetch breadcrumb parents
  const { data: parentCommunity } = useGetCommunity(community?.parentId ?? 0, {
    query: { enabled: !!community?.parentId, queryKey: getGetCommunityQueryKey(community?.parentId ?? 0) },
  });
  const { data: grandparentCommunity } = useGetCommunity(parentCommunity?.parentId ?? 0, {
    query: { enabled: !!parentCommunity?.parentId, queryKey: getGetCommunityQueryKey(parentCommunity?.parentId ?? 0) },
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

  // Forum
  const { data: forumTopics = [], isLoading: topicsLoading } = useListTopics(communityId, {
    query: { enabled: !!communityId },
  });
  const createTopic = useCreateTopic();
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicContent, setTopicContent] = useState("");

  function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!topicTitle.trim() || !topicContent.trim()) return;
    createTopic.mutate(
      { communityId, data: { title: topicTitle, content: topicContent } },
      {
        onSuccess: () => {
          setTopicTitle("");
          setTopicContent("");
          setShowTopicForm(false);
          toast({ title: "Tópico criado!", description: "Seu tópico foi publicado no fórum." });
        },
        onError: () => toast({ title: "Erro ao criar tópico", variant: "destructive" }),
      }
    );
  }

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
          toast({ title: "Publicação criada!", description: `Compartilhado em ${community?.name}.` });
        },
      }
    );
  }

  function handleJoin() {
    joinCommunity.mutate(
      { id: communityId, data: { userId: user?.id ?? 1 } },
      {
        onSuccess: () => {
          setJoined(true);
          queryClient.invalidateQueries({ queryKey: getGetCommunityQueryKey(communityId) });
          toast({ title: "Bem-vindo(a)!", description: `Você agora faz parte de ${community?.name}.` });
        },
      }
    );
  }

  if (communityLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-52 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-full" />
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
  const hasSubCommunities = (subCommunities?.length ?? 0) > 0;
  const subLabel = subTabLabel[community.category] ?? "Sub-comunidades";
  const heroGradient = categoryColors[community.category] ?? "from-primary to-primary/80";
  const campusImg = community.category === "campus" ? getCampusImage(community.name) : null;

  // Build breadcrumb trail
  const breadcrumbs = [
    { label: "Comunidades", path: "/communities" },
    grandparentCommunity ? { label: grandparentCommunity.name, path: `/communities/${grandparentCommunity.id}` } : null,
    parentCommunity ? { label: parentCommunity.name, path: `/communities/${parentCommunity.id}` } : null,
  ].filter(Boolean) as { label: string; path: string }[];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <button
                onClick={() => setLocation(crumb.path)}
                className="hover:text-primary transition-colors hover:underline"
              >
                {crumb.label}
              </button>
            </span>
          ))}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{community.name}</span>
        </nav>

        {/* Hero */}
        <div className="rounded-2xl text-white relative overflow-hidden shadow-lg">
          {/* Background: imagem de campus ou gradiente */}
          {campusImg ? (
            <>
              <img
                src={campusImg}
                alt={community.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${heroGradient} opacity-75`} />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${heroGradient}`} />
          )}
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <Icon className="w-72 h-72" />
          </div>
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white/20 text-white border-none px-3 py-1 uppercase tracking-widest text-xs font-bold backdrop-blur-sm">
                {categoryLabels[community.category] ?? community.category}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">{community.name}</h1>
            <p className="text-white/80 text-base max-w-2xl leading-relaxed mb-6">
              {community.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Users className="h-4 w-4" /> {community.membersCount} Membros
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <FileText className="h-4 w-4" /> {community.postsCount} Publicações
              </div>
              {hasSubCommunities && (
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Layers className="h-4 w-4" /> {subCommunities?.length} {subLabel}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="feed" className="space-y-4">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto pb-0 px-0">
                <TabsTrigger
                  value="feed"
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=inactive]:border-transparent gap-2"
                >
                  <Hash className="h-4 w-4" /> Publicações
                </TabsTrigger>
                {hasSubCommunities && (
                  <TabsTrigger
                    value="subcommunities"
                    className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=inactive]:border-transparent gap-2"
                  >
                    <Layers className="h-4 w-4" /> {subLabel}
                    <span className="ml-1 bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {subCommunities?.length}
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="forum"
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=inactive]:border-transparent gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> Fórum
                  {forumTopics.length > 0 && (
                    <span className="ml-1 bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {forumTopics.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-t-lg rounded-b-none border border-b-0 data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=inactive]:border-transparent gap-2"
                >
                  <Info className="h-4 w-4" /> Sobre
                </TabsTrigger>
              </TabsList>

              {/* FEED TAB */}
              <TabsContent value="feed" className="space-y-4 mt-0">
                {/* Post creation */}
                <Card className="border-primary/10 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-3">
                          <Avatar className="h-9 w-9 border border-border shrink-0 hidden sm:block">
                            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                              {user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "?"}
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
                                    className="min-h-[90px] resize-none border-primary/20 focus-visible:ring-primary text-sm"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={createPost.isPending || !form.watch("content")}
                            size="sm"
                            className="rounded-full px-5"
                          >
                            {createPost.isPending ? "Publicando..." : "Publicar"}
                            <Send className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Posts */}
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-36 w-full" />)}
                  </div>
                ) : posts?.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground border rounded-xl bg-card border-dashed border-primary/20">
                    <FileText className="mx-auto h-10 w-10 mb-3 opacity-30" />
                    <p className="font-medium">Nenhuma publicação ainda</p>
                    <p className="text-sm mt-1">Seja o primeiro a compartilhar algo nesta comunidade!</p>
                  </div>
                ) : (
                  posts?.map((post) => (
                    <Card key={post.id} className="border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-start gap-3 pb-3 pt-4">
                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          {post.authorAvatarUrl ? <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} /> : null}
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                            {post.authorName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 justify-between">
                            <span className="font-semibold text-sm text-foreground">{post.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(post.createdAt), "d MMM, HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{post.authorCourse}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 px-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-start gap-1 border-t bg-muted/20 py-2 px-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 rounded-full h-8 px-3 text-xs">
                          <Heart className="mr-1.5 h-3.5 w-3.5" /> {post.likesCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full h-8 px-3 text-xs">
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> {post.commentsCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full h-8 px-3 text-xs">
                          <Share2 className="mr-1.5 h-3.5 w-3.5" /> Compartilhar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* SUB-COMMUNITIES TAB */}
              {hasSubCommunities && (
                <TabsContent value="subcommunities" className="mt-0">
                  {subLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        {subLabel} dentro de <span className="font-medium text-foreground">{community.name}</span> — cada uma com suas próprias publicações, membros e funcionalidades.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {subCommunities?.map((sub) => {
                          const SubIcon = categoryIcons[sub.category] || Globe;
                          const subGradient = categoryColors[sub.category] ?? "from-primary to-primary/80";
                          const hasSubChildren = (sub.childrenCount ?? 0) > 0;
                          return (
                            <Card
                              key={sub.id}
                              className="border-primary/10 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group overflow-hidden flex flex-col"
                              onClick={() => setLocation(`/communities/${sub.id}`)}
                            >
                              <div className={`h-16 bg-gradient-to-r ${subGradient} flex items-center justify-center relative`}>
                                <SubIcon className="h-8 w-8 text-white/20" />
                                {hasSubChildren && (
                                  <Badge className="absolute top-2 right-2 bg-white/20 text-white border-none text-xs backdrop-blur-sm">
                                    {sub.childrenCount} sub
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-4 flex-1">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                                  {sub.name}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {sub.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {sub.membersCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> {sub.postsCount}
                                  </span>
                                  {hasSubChildren && (
                                    <span className="flex items-center gap-1">
                                      <Layers className="h-3 w-3" /> {sub.childrenCount}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                              <div className="px-4 pb-4">
                                <div className="flex items-center justify-between text-xs text-primary font-medium group-hover:underline">
                                  <span>Entrar na comunidade</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>
              )}

              {/* FORUM TAB */}
              <TabsContent value="forum" className="mt-0 space-y-4">
                {/* Header + botão novo tópico */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {forumTopics.length === 0
                      ? "Nenhum tópico ainda — crie o primeiro!"
                      : `${forumTopics.length} tópico${forumTopics.length !== 1 ? "s" : ""}`}
                  </p>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowTopicForm(v => !v)}
                  >
                    <Plus className="h-4 w-4" />
                    Novo tópico
                  </Button>
                </div>

                {/* Formulário de novo tópico */}
                {showTopicForm && (
                  <Card className="border-primary/20 shadow-sm">
                    <CardContent className="p-4">
                      <form onSubmit={handleCreateTopic} className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Título do tópico
                          </label>
                          <input
                            type="text"
                            value={topicTitle}
                            onChange={e => setTopicTitle(e.target.value)}
                            placeholder="Ex: Dúvida sobre inscrição no semestre..."
                            maxLength={200}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Conteúdo
                          </label>
                          <Textarea
                            value={topicContent}
                            onChange={e => setTopicContent(e.target.value)}
                            placeholder="Descreva sua pergunta ou assunto em detalhes..."
                            className="min-h-[100px] resize-none border-primary/20 focus-visible:ring-primary text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setShowTopicForm(false); setTopicTitle(""); setTopicContent(""); }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!topicTitle.trim() || !topicContent.trim() || createTopic.isPending}
                            className="gap-2"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {createTopic.isPending ? "Publicando..." : "Publicar tópico"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de tópicos */}
                {topicsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                  </div>
                ) : forumTopics.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Seja o primeiro a criar um tópico!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forumTopics.map((topic: ForumTopic) => (
                      <Card
                        key={topic.id}
                        className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                        onClick={() => setLocation(`/forum/${topic.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {topic.isPinned && (
                                  <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                                )}
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                                  {topic.title}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {topic.content}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="font-medium">{topic.authorName}</span>
                                <span>·</span>
                                <span>{format(new Date(topic.createdAt), "d MMM yyyy", { locale: ptBR })}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {topic.repliesCount} resposta{topic.repliesCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ABOUT TAB */}
              <TabsContent value="about" className="mt-0">
                <Card className="border-primary/10">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Descrição</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{community.membersCount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Membros</p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{community.postsCount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Publicações</p>
                      </div>
                      {hasSubCommunities && (
                        <div className="bg-muted/40 rounded-lg p-3 text-center col-span-2">
                          <p className="text-2xl font-bold text-foreground">{subCommunities?.length}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      Criada em {format(new Date(community.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    {parentCommunity && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Parte de</p>
                        <button
                          onClick={() => setLocation(`/communities/${parentCommunity.id}`)}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          {(() => { const PI = categoryIcons[parentCommunity.category] || Globe; return <PI className="h-4 w-4" />; })()}
                          {parentCommunity.name}
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Join card */}
            <Card className="border-primary/10 sticky top-24">
              <CardContent className="p-4 space-y-3">
                {joined ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-green-600 font-medium text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    Você é membro desta comunidade
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleJoin}
                    disabled={joinCommunity.isPending}
                  >
                    {joinCommunity.isPending ? "Entrando..." : "Participar da Comunidade"}
                    {!joinCommunity.isPending && <Users className="ml-2 h-4 w-4" />}
                  </Button>
                )}
                <div className="text-center text-xs text-muted-foreground">
                  {community.membersCount} {community.membersCount === 1 ? "membro" : "membros"} · {community.postsCount} {community.postsCount === 1 ? "publicação" : "publicações"}
                </div>
              </CardContent>
            </Card>

            {/* Sub-communities quick list in sidebar */}
            {hasSubCommunities && (
              <Card className="border-primary/10">
                <CardHeader className="pb-2 pt-4 px-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {subLabel} ({subCommunities?.length})
                  </h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1">
                  {subCommunities?.slice(0, 6).map((sub) => {
                    const SubIcon = categoryIcons[sub.category] || Globe;
                    return (
                      <button
                        key={sub.id}
                        className="w-full flex items-center gap-2.5 py-2 px-2 hover:bg-muted/60 rounded-lg transition-colors text-left group"
                        onClick={() => setLocation(`/communities/${sub.id}`)}
                      >
                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <SubIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {sub.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {sub.membersCount} membros
                            {(sub.childrenCount ?? 0) > 0 && ` · ${sub.childrenCount} sub`}
                          </p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                      </button>
                    );
                  })}
                  {(subCommunities?.length ?? 0) > 6 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      +{(subCommunities?.length ?? 0) - 6} mais na aba acima
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parent link */}
            {parentCommunity && (
              <Card className="border-primary/10">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Parte de</p>
                  <button
                    onClick={() => setLocation(`/communities/${parentCommunity.id}`)}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group w-full"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {(() => { const PI = categoryIcons[parentCommunity.category] || Globe; return <PI className="h-4 w-4 text-primary" />; })()}
                    </div>
                    <span className="font-medium group-hover:underline flex-1 text-left">{parentCommunity.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
