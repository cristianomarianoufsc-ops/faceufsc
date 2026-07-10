import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Search, Plus, BookOpen, FlaskConical, Activity, Music, Home, Globe, Building2, Layers, ChevronRight } from "lucide-react";
import { 
  useListCommunities, 
  useCreateCommunity, 
  getListCommunitiesQueryKey,
  useJoinCommunity
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { getCampusImage } from "@/data/campus-images";

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

const categories = [
  { value: "campus", label: "Campus", icon: Building2 },
  { value: "center", label: "Centro", icon: Layers },
  { value: "course", label: "Curso", icon: BookOpen },
  { value: "research", label: "Pesquisa", icon: FlaskConical },
  { value: "sports", label: "Esportes", icon: Activity },
  { value: "culture", label: "Cultura", icon: Music },
  { value: "housing", label: "Moradia", icon: Home },
  { value: "general", label: "Geral", icon: Globe },
];

const createCommunitySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descricao deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
});

export default function Communities() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryParams = search ? { search } : { topLevel: true };
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

  function onSubmit(values: z.infer<typeof createCommunitySchema>) {
    createCommunity.mutate(
      { data: values },
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

  function handleJoin(id: number, e: React.MouseEvent) {
    e.stopPropagation();
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Comunidades</h1>
            <p className="text-muted-foreground mt-1">Encontre sua turma na UFSC</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar comunidades..." 
                className="pl-9 bg-card border-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Comunidade</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Centro de Desportos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  <div className="flex items-center">
                                    <c.icon className="mr-2 h-4 w-4" />
                                    {c.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Sobre o que é esta comunidade?" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={createCommunity.isPending}>
                        {createCommunity.isPending ? "Criando..." : "Criar Comunidade"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-primary/10 overflow-hidden">
                <div className="h-32 bg-primary/5 animate-pulse" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))
          ) : communities?.length === 0 ? (
            <div className="col-span-full text-center py-16 border rounded-xl bg-card border-dashed border-primary/20">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma comunidade encontrada</h3>
              <p className="text-muted-foreground">Tente outra busca ou crie uma nova.</p>
            </div>
          ) : (
            communities?.map((community, index) => {
              const cat = categories.find(c => c.value === community.category);
              const Icon = cat?.icon || Globe;
              const hasChildren = (community.childrenCount ?? 0) > 0;

              return (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="h-full flex flex-col border-primary/10 hover:shadow-md transition-all hover:border-primary/30 group cursor-pointer"
                    onClick={() => setLocation(`/communities/${community.id}`)}
                  >
                    {(() => {
                      const campusImg = community.category === "campus" ? getCampusImage(community.name) : null;
                      return (
                        <div className="h-32 relative overflow-hidden rounded-t-lg">
                          {campusImg ? (
                            <>
                              <img
                                src={campusImg}
                                alt={community.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center">
                              <Icon className="h-12 w-12 text-primary-foreground/20" />
                            </div>
                          )}
                          {hasChildren && (
                            <Badge className="absolute top-2 right-2 bg-secondary/90 text-secondary-foreground text-xs backdrop-blur-sm">
                              {community.childrenCount} sub-comunidades
                            </Badge>
                          )}
                          {campusImg && (
                            <div className="absolute bottom-2 left-3">
                              <Icon className="h-5 w-5 text-white/70" />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                          {community.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <Icon className="h-3 w-3" />
                        {cat?.label ?? community.category}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {community.membersCount} membros
                        </span>
                        <span>•</span>
                        <span>{community.postsCount} publicações</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={(e) => handleJoin(community.id, e)}
                        disabled={joinCommunity.isPending}
                      >
                        Participar
                      </Button>
                      {hasChildren && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="border border-primary/20 hover:bg-primary/10"
                          onClick={() => setLocation(`/communities/${community.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
