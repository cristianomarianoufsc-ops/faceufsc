import { Link } from "wouter";
import { Users, UserCheck, Clock, CheckCircle, XCircle, UserPlus } from "lucide-react";
import {
  useListConnections,
  getListConnectionsQueryKey,
  useListConnectionRequests,
  getListConnectionRequestsQueryKey,
  useUpdateConnection,
  useDeleteConnection,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { motion } from "framer-motion";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function Connections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections, isLoading: connectionsLoading } = useListConnections({
    query: { queryKey: getListConnectionsQueryKey() },
  });

  const { data: requests, isLoading: requestsLoading } = useListConnectionRequests({
    query: { queryKey: getListConnectionRequestsQueryKey() },
  });

  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();

  function handleAccept(id: number) {
    updateConnection.mutate(
      { id, data: { action: "accept" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListConnectionRequestsQueryKey() });
          toast({ title: "Conexão aceita!", description: "Agora vocês estão conectados." });
        },
        onError: () => toast({ title: "Erro ao aceitar pedido", variant: "destructive" }),
      }
    );
  }

  function handleReject(id: number) {
    updateConnection.mutate(
      { id, data: { action: "reject" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConnectionRequestsQueryKey() });
          toast({ title: "Pedido recusado." });
        },
        onError: () => toast({ title: "Erro ao recusar pedido", variant: "destructive" }),
      }
    );
  }

  function handleRemove(id: number) {
    deleteConnection.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
          toast({ title: "Conexão removida." });
        },
        onError: () => toast({ title: "Erro ao remover conexão", variant: "destructive" }),
      }
    );
  }

  const pendingCount = requests?.length ?? 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Conexões</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua rede na UFSC</p>
        </div>

        <Tabs defaultValue="connections">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Minhas Conexões
              {(connections?.length ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {connections?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pedidos
              {pendingCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* MY CONNECTIONS */}
          <TabsContent value="connections" className="mt-6">
            {connectionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-primary/10">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : connections?.length === 0 ? (
              <div className="text-center py-16 border rounded-xl bg-card border-dashed border-primary/20">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma conexão ainda</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Explore o diretório e conecte-se com colegas da UFSC
                </p>
                <Button asChild variant="default" size="sm">
                  <Link href="/people">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Explorar pessoas
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections?.map((conn, idx) => {
                  const isRequester = conn.requesterId === user?.id;
                  const partnerName = isRequester ? conn.receiverName : conn.requesterName;
                  const partnerAvatar = isRequester ? conn.receiverAvatarUrl : conn.requesterAvatarUrl;
                  const partnerCourse = isRequester ? conn.receiverCourse : conn.requesterCourse;
                  const partnerId = isRequester ? conn.receiverId : conn.requesterId;

                  return (
                    <motion.div
                      key={conn.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card className="border-primary/10 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                          <Link href={`/profile/${partnerId}`}>
                            <Avatar className="h-14 w-14 cursor-pointer hover:opacity-80 transition-opacity border-2 border-background shadow-sm">
                              {partnerAvatar && <AvatarFallback className="sr-only" />}
                              {partnerAvatar ? (
                                <img src={partnerAvatar} alt={partnerName} className="h-full w-full object-cover rounded-full" />
                              ) : (
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                  {getInitials(partnerName)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile/${partnerId}`}>
                              <p className="font-semibold text-foreground hover:text-primary transition-colors truncate cursor-pointer">
                                {partnerName}
                              </p>
                            </Link>
                            <p className="text-sm text-muted-foreground truncate">{partnerCourse}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                              <Link href={`/profile/${partnerId}`}>Ver perfil</Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemove(conn.id)}
                              disabled={deleteConnection.isPending}
                              title="Remover conexão"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* PENDING REQUESTS */}
          <TabsContent value="requests" className="mt-6">
            {requestsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-primary/10">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : requests?.length === 0 ? (
              <div className="text-center py-16 border rounded-xl bg-card border-dashed border-primary/20">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <h3 className="text-lg font-medium text-foreground mb-1">Nenhum pedido pendente</h3>
                <p className="text-muted-foreground text-sm">
                  Você está em dia! Novos pedidos de conexão aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests?.map((req, idx) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="border-primary/10">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Link href={`/profile/${req.requesterId}`}>
                          <Avatar className="h-14 w-14 cursor-pointer hover:opacity-80 transition-opacity border-2 border-background shadow-sm">
                            {req.requesterAvatarUrl ? (
                              <img src={req.requesterAvatarUrl} alt={req.requesterName} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                {getInitials(req.requesterName)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/profile/${req.requesterId}`}>
                            <p className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                              {req.requesterName}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">{req.requesterCourse}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            Quer se conectar com você
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => handleAccept(req.id)}
                            disabled={updateConnection.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/20 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleReject(req.id)}
                            disabled={updateConnection.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
