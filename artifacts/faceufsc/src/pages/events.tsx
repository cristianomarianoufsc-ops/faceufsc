import { useRoute } from "wouter";
import { format } from "date-fns";
import { Users, Calendar, MapPin, Search } from "lucide-react";
import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";

export default function Events() {
  const [search, setSearch] = useState("");
  const { data: events, isLoading } = useListEvents({ query: { queryKey: getListEventsQueryKey() } });

  const filteredEvents = events?.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Eventos</h1>
            <p className="text-muted-foreground mt-1">O que está acontecendo no campus</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar eventos..." 
                className="pl-9 bg-card border-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Criar Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-primary/10 overflow-hidden">
                <div className="h-40 bg-primary/5 animate-pulse" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredEvents?.length === 0 ? (
            <div className="col-span-full text-center py-16 border rounded-xl bg-card border-dashed border-primary/20">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground">Tente outro termo de busca.</p>
            </div>
          ) : (
            filteredEvents?.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/events/${event.id}`}>
                  <Card className="h-full flex flex-col border-primary/10 hover:shadow-lg transition-all hover:border-primary/30 cursor-pointer group overflow-hidden">
                    <div className="h-40 bg-primary/10 relative">
                      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg text-center shadow-sm border border-border/50">
                        <div className="text-xs font-bold text-primary uppercase">{format(new Date(event.date), "MMM")}</div>
                        <div className="text-xl font-bold leading-none">{format(new Date(event.date), "d")}</div>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                        {event.category}
                      </div>
                      <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary/60" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary/60" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/30 py-3 flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.attendeesCount} participando
                      </span>
                      <span className="text-primary font-medium group-hover:underline">Ver detalhes</span>
                    </CardFooter>
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
