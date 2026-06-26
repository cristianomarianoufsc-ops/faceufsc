import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MessageCircle, Heart, Share2, Send, Users, Calendar, Activity } from "lucide-react";
import { 
  useListPosts, 
  useCreatePost, 
  getListPostsQueryKey,
  useGetFeedStats,
  useGetRecentActivity
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const postSchema = z.object({
  content: z.string().min(1, "A publicacao nao pode estar vazia"),
});

export default function Feed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: posts, isLoading: postsLoading } = useListPosts({}, { 
    query: { queryKey: getListPostsQueryKey({}) } 
  });
  
  const { data: stats, isLoading: statsLoading } = useGetFeedStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const createPost = useCreatePost();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    createPost.mutate(
      { data: { content: values.content, authorId: 1 } },
      {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({}) });
          toast({
            title: "Publicação criada",
            description: "Sua publicação foi compartilhada com a comunidade.",
          });
        },
      }
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border border-border hidden sm:block">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">JD</AvatarFallback>
                    </Avatar>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea 
                              placeholder="O que está acontecendo no campus?" 
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

          <div className="space-y-6">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-primary/10">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : posts?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                Nenhuma publicação ainda. Seja o primeiro a compartilhar algo!
              </div>
            ) : (
              posts?.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start gap-4 pb-4">
                      <Avatar className="h-10 w-10 border border-border">
                        {post.authorAvatarUrl ? (
                          <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                        <span className="text-sm text-muted-foreground">
                          {post.authorCourse} {post.communityName && `• em ${post.communityName}`}
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
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {post.commentsCount}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <h3 className="font-bold text-lg text-secondary flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pulso do Campus
              </h3>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-primary-foreground/20" />
                  <Skeleton className="h-4 w-3/4 bg-primary-foreground/20" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalUsers}</span>
                    <span className="text-xs text-primary-foreground/80 uppercase tracking-wider">Membros</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalCommunities}</span>
                    <span className="text-xs text-primary-foreground/80 uppercase tracking-wider">Comunidades</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalEvents}</span>
                    <span className="text-xs text-primary-foreground/80 uppercase tracking-wider">Eventos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalPosts}</span>
                    <span className="text-xs text-primary-foreground/80 uppercase tracking-wider">Publicações</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <h3 className="font-bold text-foreground">Atividade Recente</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : activity?.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="text-xs bg-secondary/20 text-secondary-foreground">{item.actorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-foreground">
                        <span className="font-medium">{item.actorName}</span> {item.description}
                      </p>
                      <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
