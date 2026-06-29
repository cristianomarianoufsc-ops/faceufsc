import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { CourseAutocomplete, DepartmentBadge } from "@/components/course-autocomplete";
import { DEPARTMENT_CONFIG } from "@/data/ufsc-courses";

const loginSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

const ALLOWED_DOMAINS = ["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"];

export default function Landing() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [reg, setReg] = useState({
    name: "", email: "", password: "", course: "",
    department: "", entryYear: String(new Date().getFullYear()), role: "student",
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleRegChange(field: keyof typeof reg) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setReg(prev => ({ ...prev, [field]: e.target.value }));
      if (regErrors[field]) setRegErrors(prev => ({ ...prev, [field]: "" }));
    };
  }

  function validateReg() {
    const errs: Record<string, string> = {};
    if (reg.name.trim().length < 3) errs.name = "Nome deve ter pelo menos 3 caracteres.";
    if (!reg.email.includes("@")) errs.email = "Insira um e-mail válido.";
    else if (!ALLOWED_DOMAINS.some(d => reg.email.endsWith(d)))
      errs.email = "Use um e-mail institucional da UFSC.";
    if (reg.password.length < 6) errs.password = "A senha deve ter pelo menos 6 caracteres.";
    if (reg.course.trim().length < 2) errs.course = "Informe seu curso ou área.";
    if (reg.department.trim().length < 2) errs.department = "Informe seu departamento.";
    if (reg.entryYear.length < 4) errs.entryYear = "Informe o ano de ingresso.";
    return errs;
  }

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      await login(values.email, values.password);
      setLocation("/feed");
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err.message, variant: "destructive" });
    }
  }

  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateReg();
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }
    setSubmitting(true);
    try {
      await register(reg);
      setPendingEmail(reg.email);
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground";

  if (pendingEmail) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Verifique seu e-mail</h2>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Enviamos um link de confirmação para<br />
              <strong className="text-foreground">{pendingEmail}</strong>
            </p>
            <p className="text-muted-foreground text-sm mt-3">
              Clique no link no e-mail para criar sua conta. O link expira em 24 horas.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique também as pastas de <strong>Spam</strong> ou <strong>Filtrados</strong>.{" "}
              <button
                className="text-primary underline"
                onClick={() => { setPendingEmail(null); setTab("register"); }}
              >
                Tentar novamente
              </button>
            </p>
            <button
              className="text-xs text-muted-foreground underline"
              onClick={() => { setPendingEmail(null); setTab("login"); }}
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row">
      <div className="flex-1 bg-primary text-primary-foreground flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-secondary mb-6">
            FaceUfsc
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 leading-relaxed">
            A alma digital da Universidade Federal de Santa Catarina.
          </p>
          <div className="space-y-6 text-primary-foreground/80">
            <p className="text-lg">
              Conecte-se com colegas, descubra oportunidades de pesquisa e vivencie a vida universitária além da sala de aula.
            </p>
            <div className="flex flex-col gap-3 pt-8">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <span>Encontre comunidades e grupos de estudo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <span>Fique por dentro dos eventos do campus</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <span>Conecte-se com egressos e professores</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 bg-background flex flex-col px-8 py-12 md:px-16 lg:px-24 items-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-6 my-auto"
        >
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "login" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "register" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              Criar conta
            </button>
          </div>

          {tab === "login" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
                <p className="text-muted-foreground text-sm mt-1">Entre na sua conta UFSC</p>
              </div>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="matricula@grad.ufsc.br" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="pr-10"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
              <p className="text-center text-xs text-muted-foreground">
                Não tem conta?{" "}
                <button onClick={() => setTab("register")} className="text-primary underline">
                  Cadastre-se
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Criar conta</h2>
                <p className="text-muted-foreground text-sm mt-1">Use seu e-mail institucional da UFSC</p>
              </div>
              <form onSubmit={onRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Nome completo</label>
                  <input
                    className={inputClass}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    value={reg.name}
                    onChange={handleRegChange("name")}
                  />
                  {regErrors.name && <p className="text-sm font-medium text-destructive">{regErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">E-mail UFSC</label>
                  <input
                    className={inputClass}
                    placeholder="matricula@grad.ufsc.br"
                    autoComplete="email"
                    type="email"
                    value={reg.email}
                    onChange={handleRegChange("email")}
                  />
                  {regErrors.email && <p className="text-sm font-medium text-destructive">{regErrors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  <div className="relative">
                    <input
                      className={inputClass + " pr-10"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={reg.password}
                      onChange={handleRegChange("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {regErrors.password && <p className="text-sm font-medium text-destructive">{regErrors.password}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Vínculo</label>
                    <select
                      className={inputClass}
                      value={reg.role}
                      onChange={handleRegChange("role")}
                    >
                      <option value="student">Estudante</option>
                      <option value="professor">Professor</option>
                      <option value="staff">Servidor</option>
                      <option value="alumni">Egresso</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Ano de ingresso</label>
                    <input
                      className={inputClass}
                      placeholder="2024"
                      maxLength={4}
                      value={reg.entryYear}
                      onChange={handleRegChange("entryYear")}
                    />
                    {regErrors.entryYear && <p className="text-sm font-medium text-destructive">{regErrors.entryYear}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Curso / Área</label>
                  <CourseAutocomplete
                    value={reg.course}
                    className={inputClass}
                    error={regErrors.course}
                    onInput={v => setReg(r => ({ ...r, course: v }))}
                    onChange={c => setReg(r => ({ ...r, course: c.name, department: c.department }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Departamento / Centro</label>
                  {reg.department && DEPARTMENT_CONFIG[reg.department] ? (
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md border ${DEPARTMENT_CONFIG[reg.department].bg} ${DEPARTMENT_CONFIG[reg.department].border}`}>
                      <DepartmentBadge code={reg.department} />
                      <span className={`text-sm font-medium ${DEPARTMENT_CONFIG[reg.department].text}`}>
                        {DEPARTMENT_CONFIG[reg.department].label.replace(`${reg.department} — `, "")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-1 text-sm text-muted-foreground">
                      Preenchido automaticamente ao escolher o curso
                    </div>
                  )}
                  {regErrors.department && <p className="text-sm font-medium text-destructive">{regErrors.department}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Cadastrando..." : "Criar conta"}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground">
                Já tem conta?{" "}
                <button onClick={() => setTab("login")} className="text-primary underline">
                  Entrar
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
