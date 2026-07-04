import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Users, Calendar, MessageSquare, Home, Menu, LogOut, Search, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "@/contexts/auth";
import { useListConnectionRequests, getListConnectionRequestsQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const { data: pendingRequests } = useListConnectionRequests({
    query: {
      queryKey: getListConnectionRequestsQueryKey(),
      enabled: !!user,
      refetchInterval: 30000, // refetch every 30s
    },
  });

  const pendingCount = pendingRequests?.length ?? 0;

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Comunidades", href: "/communities", icon: MessageSquare },
    { label: "Eventos", href: "/events", icon: Calendar },
    { label: "Pessoas", href: "/people", icon: Users },
    { label: "Conexões", href: "/connections", icon: UserCheck, badge: pendingCount },
  ];

  const initials = user
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  async function handleLogout() {
    await logout();
    setLocation("/");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-primary text-primary-foreground border-r-0">
                <div className="flex flex-col h-full py-6">
                  <Link href="/feed" className="text-2xl font-bold tracking-tight mb-8 px-4 text-secondary">
                    FaceUfsc
                  </Link>
                  <nav className="flex flex-col gap-2 px-2 flex-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-primary/80"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                          {item.badge != null && item.badge > 0 && (
                            <Badge className="ml-auto h-5 px-1.5 text-xs bg-secondary text-secondary-foreground">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="px-4 mt-auto">
                    <Button variant="outline" className="w-full justify-start text-primary-foreground border-primary-foreground/20 hover:bg-primary/80" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-secondary">FaceUfsc</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-primary/80 text-primary-foreground"
                    }`}
                  >
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary-foreground/60" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-full bg-primary-foreground/10 border-none text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-secondary pl-9"
              />
            </div>

            <button onClick={handleLogout} className="hidden md:flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-xs transition-colors">
              <LogOut className="h-4 w-4" />
            </button>

            <Link href={user ? `/profile/${user.id}` : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover border-2 border-primary-foreground/20"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold border-2 border-primary-foreground/20 text-sm">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
