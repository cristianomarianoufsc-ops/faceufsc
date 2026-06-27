import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Feed from "@/pages/feed";
import Communities from "@/pages/communities";
import CommunityDetail from "@/pages/community-detail";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import People from "@/pages/people";
import Profile from "@/pages/profile";
import { ComponentType } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AuthRoute({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/feed" />;
  }

  return <Component />;
}

const AuthLandingRoute = () => <AuthRoute component={Landing} />;
const ProtectedFeedRoute = () => <ProtectedRoute component={Feed} />;
const ProtectedCommunitiesRoute = () => <ProtectedRoute component={Communities} />;
const ProtectedCommunityDetailRoute = () => <ProtectedRoute component={CommunityDetail} />;
const ProtectedEventsRoute = () => <ProtectedRoute component={Events} />;
const ProtectedEventDetailRoute = () => <ProtectedRoute component={EventDetail} />;
const ProtectedPeopleRoute = () => <ProtectedRoute component={People} />;
const ProtectedProfileRoute = () => <ProtectedRoute component={Profile} />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthLandingRoute} />
      <Route path="/feed" component={ProtectedFeedRoute} />
      <Route path="/communities" component={ProtectedCommunitiesRoute} />
      <Route path="/communities/:id" component={ProtectedCommunityDetailRoute} />
      <Route path="/events" component={ProtectedEventsRoute} />
      <Route path="/events/:id" component={ProtectedEventDetailRoute} />
      <Route path="/people" component={ProtectedPeopleRoute} />
      <Route path="/profile/:id" component={ProtectedProfileRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
