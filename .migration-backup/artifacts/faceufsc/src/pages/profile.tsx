import { useRoute } from "wouter";
import { format } from "date-fns";
import { GraduationCap, BookOpen, Building, Briefcase, CalendarDays, MapPin, Users, MessageSquare } from "lucide-react";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const userId = params?.id ? parseInt(params.id) : 0;
  
  const { data: user, isLoading } = useGetUser(userId, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId) }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'professor': return <BookOpen className="h-4 w-4" />;
      case 'staff': return <Building className="h-4 w-4" />;
      case 'alumni': return <Briefcase className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><Skeleton className="h-64 w-full" /></div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return <Layout><div className="text-center py-20">Usuário não encontrado</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-48 bg-gradient-to-r from-primary/80 to-primary rounded-xl relative mb-20 shadow-sm">
          <div className="absolute -bottom-16 left-8">
            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {user.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
              <span className="capitalize font-medium text-primary flex items-center gap-1.5">
                {getRoleIcon(user.role)}
                {user.role}
              </span>
              <span>•</span>
              {user.course}
            </p>
          </div>
          <div className="flex gap-4 text-sm font-medium">
             <div className="flex flex-col items-center p-3 bg-card border rounded-lg min-w-[100px]">
               <span className="text-2xl font-bold text-primary">{user.connectionsCount}</span>
               <span className="text-muted-foreground text-xs uppercase tracking-wider">Conexões</span>
             </div>
             <div className="flex flex-col items-center p-3 bg-card border rounded-lg min-w-[100px]">
               <span className="text-2xl font-bold text-primary">{user.communitiesCount}</span>
               <span className="text-muted-foreground text-xs uppercase tracking-wider">Comunidades</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="border-primary/10 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <h3 className="font-bold text-foreground">Sobre</h3>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Departamento</div>
                    <div className="text-muted-foreground">{user.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ano de Ingresso</div>
                    <div className="text-muted-foreground">{user.entryYear}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Campus</div>
                    <div className="text-muted-foreground">Florianópolis</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <h3 className="font-bold text-foreground">Habilidades e Interesses</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {user.skills.length > 0 ? (
                    user.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-medium">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-sm h-full">
              <CardHeader className="pb-3 border-b">
                <h3 className="font-bold text-foreground">Sobre mim</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  {user.bio ? (
                    user.bio.split('\n').map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p className="italic">Este usuário ainda não escreveu uma apresentação.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
