import { useRoute } from "wouter";
import { Users, Calendar, MapPin, Clock, Share2, Info } from "lucide-react";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;
  
  const { data: event, isLoading } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) return <Layout><div className="text-center py-20">Evento não encontrado</div></Layout>;

  const dateObj = new Date(event.date);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-[300px] bg-primary/10 rounded-xl relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
           <div className="z-20 absolute bottom-6 left-6 text-foreground flex items-center gap-4">
             <div className="bg-background px-4 py-2 rounded-lg text-center shadow-lg border border-border/50">
               <div className="text-sm font-bold text-primary uppercase">{format(dateObj, "MMM")}</div>
               <div className="text-2xl font-bold leading-none">{format(dateObj, "d")}</div>
             </div>
             <div>
                <div className="text-sm font-medium text-secondary uppercase tracking-wider mb-1">{event.category}</div>
                <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Sobre
              </h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                {event.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/10 shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">{format(dateObj, "EEEE, MMMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">{event.attendeesCount} Participantes</div>
                      {event.maxAttendees && <div className="text-sm text-muted-foreground">Capacidade: {event.maxAttendees}</div>}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-1">Organizado por</div>
                  <div className="font-medium">{event.organizer}</div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" size="lg">
                    Participar do Evento
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
