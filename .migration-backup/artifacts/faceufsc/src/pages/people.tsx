import { useState } from "react";
import { Link } from "wouter";
import { Search, GraduationCap, Briefcase, Building, BookOpen } from "lucide-react";
import { useListUsers, getListUsersQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function People() {
  const [search, setSearch] = useState("");
  
  const { data: users, isLoading } = useListUsers(
    search ? { search } : {},
    { query: { queryKey: getListUsersQueryKey(search ? { search } : {}) } }
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-3 w-3 mr-1" />;
      case 'professor': return <BookOpen className="h-3 w-3 mr-1" />;
      case 'staff': return <Building className="h-3 w-3 mr-1" />;
      case 'alumni': return <Briefcase className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case 'professor': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case 'staff': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'alumni': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Diretório</h1>
            <p className="text-muted-foreground mt-1">Conecte-se com a comunidade UFSC</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, curso ou departamento..." 
              className="pl-9 bg-card border-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </CardContent>
              </Card>
            ))
          ) : users?.length === 0 ? (
            <div className="col-span-full text-center py-16 border rounded-xl bg-card border-dashed border-primary/20">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma pessoa encontrada</h3>
              <p className="text-muted-foreground">Tente ajustar os critérios de busca.</p>
            </div>
          ) : (
            users?.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/profile/${user.id}`}>
                  <Card className="h-full border-primary/10 hover:shadow-md transition-shadow hover:border-primary/30 cursor-pointer group">
                    <CardContent className="p-6 text-center flex flex-col items-center h-full">
                      <Avatar className="h-20 w-20 border-2 border-background shadow-sm mb-4 group-hover:scale-105 transition-transform">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 w-full">
                        {user.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-2 min-h-[40px]">
                        {user.course}
                      </p>
                      
                      <div className="mt-auto pt-2 w-full flex flex-col items-center gap-2">
                        <Badge variant="secondary" className={`${getRoleColor(user.role)} capitalize border-none font-medium flex items-center`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          <span>{user.connectionsCount} conexões</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
