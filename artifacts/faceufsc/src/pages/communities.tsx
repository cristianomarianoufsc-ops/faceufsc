import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users, Search, Plus, BookOpen, FlaskConical, Activity, Music, Home, Globe,
  Building2, Layers, GraduationCap, ChevronRight, ArrowRight, BookMarked,
} from "lucide-react";
import {
  useListCommunities,
  useCreateCommunity,
  getListCommunitiesQueryKey,
  useJoinCommunity,
} from "@workspace/api-client-react";
import type { Community } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<any>; gradient: string }> = {
  campus:   { label: "Campus",  icon: Building2,     gradient: "from-violet-600 to-purple-700" },
  centro:   { label: "Centro",  icon: Layers,         gradient: "from-blue-600 to-blue-800" },
  curso:    { label: "Curso",   icon: GraduationCap,  gradient: "from-indigo-500 to-indigo-700" },
  course:   { label: "Curso",   icon: BookOpen,       gradient: "from-indigo-500 to-indigo-700" },
  research: { label: "Pesquisa",icon: FlaskConical,   gradient: "from-emerald-600 to-teal-700" },
  sports:   { label: "Esportes",icon: Activity,       gradient: "from-orange-500 to-red-600" },
  culture:  { label: "Cultura", icon: Music,          gradient: "from-pink-500 to-rose-600" },
  housing:  { label: "Moradia", icon: Home,           gradient: "from-amber-500 to-orange-600" },
  general:  { label: "Geral",   icon: Globe,          gradient: "from-slate-500 to-slate-700" },
};

function getMeta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META.general;
}

// ─── User-created community categories ───────────────────────────────────────

const USER_CATEGORIES = [
  { value: "course",   label: "Curso" },
  { value: "research", label: "Pesquisa" },
  { value: "sports",   label: "Esportes" },
  { value: "culture",  label: "Cultura" },
  { value: "housing",  label: "Moradia" },
  { value: "general",  label: "Geral" },
];

const createCommunitySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
});

// ─── Nav path item ────────────────────────────────────────────────────────────

interface NavItem { id: number; name: string; category: string }

// ─── Community card ───────────────────────────────────────────────────────────

function CommunityCard({
  community,
  onDrillIn,
  onJoin,
  onNavigate,
  joinPending,
}: {
  community: Community;
  onDrillIn: (c: Community) => void;
  onJoin: (id: number) => void;
  onNavigate: (id: number) => void;
  joinPending: boolean;
}) {
  const meta = getMeta(community.category);
  const Icon = meta.icon;
  const hasChildren = (community.childrenCount ?? 0) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`group overflow-hidden flex flex-col h-full border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-200 ${hasChildren ? "cursor-pointer" : ""}`}
        onClick={hasChildren ? () => onDrillIn(community) : undefined}
      >
        {/* Hero gradient */}
        <div className={`h-20 bg-gradient-to-r ${meta.gradient} flex items-center justify-center text-white/20`}>
          <Icon className="h-10 w-10" />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors ${!hasChildren ? "cursor-pointer" : ""}`}
              onClick={!hasChildren ? (e) => { e.stopPropagation(); onNavigate(community.id); } : undefined}
            >
              {community.name}
            </h3>
          </div>
          <Badge variant="outline" className="w-fit text-xs gap-1 font-medium">
            <Icon className="h-3 w-3" />
            {meta.label}
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>

          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            {hasChildren ? (
              <span className="flex items-center gap-1 font-medium text-primary">
                <BookMarked className="h-3 w-3" />
                {community.childrenCount} subcomunidade{(community.childrenCount ?? 0) !== 1 ? "s" : ""}
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {community.membersCount} membro{community.membersCount !== 1 ? "s" : ""}
                </span>
                <span>•</span>
                <span>{community.postsCount} publicações</span>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {hasChildren ? (
            <Button
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors gap-1"
              onClick={(e) => { e.stopPropagation(); onDrillIn(community); }}
            >
              Explorar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={(e) => { e.stopPropagation(); onJoin(community.id); }}
              disabled={joinPending}
            >
              Participar
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Communities() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Drill-down navigation state
  const [navPath, setNavPath] = useState<NavItem[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentParent = navPath.at(-1);

  // Build query params
  const queryParams = search
    ? { search }
    : currentParent
      ? { parentId: currentParent.id }
      : {};

  const { data: communities, isLoading } = useListCommunities(
    queryParams,
    { query: { queryKey: getListCommunitiesQueryKey(queryParams) } }
  );

  const createCommunity = useCreateCommunity();
  const joinCommunity = useJoinCommunity();

  const form = useForm<z.infer<typeof createCommunitySchema>>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: { name: "", description: "", category: "" },
  });

  function drillIn(community: Community) {
    setSearch("");
    setNavPath(prev => [...prev, { id: community.id, name: community.name, category: community.category }]);
  }

  function navigateTo(index: number) {
    setNavPath(prev => prev.slice(0, index));
  }

  function onSubmit(values: z.infer<typeof createCommunitySchema>) {
    createCommunity.mutate(
      { data: { ...values, parentId: currentParent?.id ?? null } },
      {
        onSuccess: (newCommunity) => {
          setIsCreateOpen(false);
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListCommunitiesQueryKey({}) });
          toast({ title: "Comunidade criada", description: "Sua nova comunidade está pronta." });
          setLocation(`/communities/${newCommunity.id}`);
        },
      }
    );
  }

  function handleJoin(id: number) {
    joinCommunity.mutate(
      { id, data: { userId: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCommunitiesQueryKey(queryParams) });
          toast({ title: "Participando!", description: "Você agora é membro desta comunidade." });
        },
      }
    );
  }

  // Level label for empty state
  const levelLabel = currentParent
    ? getMeta(currentParent.category).label === "Campus"
      ? "centros"
      : "cursos"
    : "comunidades";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Comunidades</h1>
            <p className="text-muted-foreground mt-1">
              {currentParent
                ? `Navegando em ${currentParent.name}`
                : "Explore as comunidades da UFSC"}
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova comunidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar nova comunidade</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl><Input placeholder="Nome da comunidade" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Textarea placeholder="Sobre esta comunidade..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USER_CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createCommunity.isPending}>
                    {createCommunity.isPending ? "Criando..." : "Criar comunidade"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm flex-wrap">
          <button
            onClick={() => navigateTo(0)}
            className={`font-medium transition-colors ${navPath.length === 0 ? "text-foreground cursor-default" : "text-muted-foreground hover:text-primary"}`}
          >
            Comunidades
          </button>
          {navPath.map((item, index) => {
            const isLast = index === navPath.length - 1;
            return (
              <span key={item.id} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                <button
                  onClick={() => !isLast ? navigateTo(index + 1) : undefined}
                  className={`font-medium transition-colors ${isLast ? "text-foreground cursor-default" : "text-muted-foreground hover:text-primary"}`}
                >
                  {item.name}
                </button>
              </span>
            );
          })}
        </nav>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar em todas as comunidades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-20 w-full" />
                  <CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/3 mt-1" /></CardHeader>
                  <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5 mt-1" /></CardContent>
                  <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
                </Card>
              ))}
            </motion.div>
          ) : !communities?.length ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhuma {levelLabel} encontrada</p>
              {search && (
                <p className="text-sm mt-1">Tente outros termos de busca</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`${currentParent?.id ?? "root"}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {communities.map(community => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onDrillIn={drillIn}
                  onJoin={handleJoin}
                  onNavigate={(id) => setLocation(`/communities/${id}`)}
                  joinPending={joinCommunity.isPending}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
