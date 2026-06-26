import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function Landing() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regEntryYear, setRegEntryYear] = useState(new Date().getFullYear().toString());
  const [regCourse, setRegCourse] = useState("");
  const [regDepartment, setRegDepartment] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      await login(values.email, values.password);
      setLocation("/feed");
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err.message, variant: "destructive" });
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (regName.trim().length < 3) errors.name = "Nome deve ter pelo menos 3 caracteres.";
    if (!regEmail.includes("@")) errors.email = "Insira um e-mail válido.";
    else if (!["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"].some(d => regEmail.endsWith(d)))
      errors.email = "Use um e-mail institucional da UFSC.";
    if (regPassword.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";
    if (regCourse.trim().length < 2) errors.course = "Informe seu curso ou área.";
    if (regDepartment.trim().length < 2) errors.department = "Informe seu departamento.";
    if (regEntryYear.length < 4) errors.entryYear = "Informe o ano de ingresso.";
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setRegLoading(true);
    try {
      await register({ name: regName, email: regEmail, password: regPassword, role: regRole, entryYear: regEntryYear, course: regCourse, department: regDepartment });
      setLocation("/feed");
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar", description: err.message, variant: "destructive" });
    } finally {
      setRegLoading(false);
    }
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

      <div className="flex-1 bg-background flex flex-col justify-start px-8 py-12 md:px-16 lg:px-24 items-center overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
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
                        <FormControl>
                          <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                        </FormControl>
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
              <form onSubmit={onRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome completo</label>
                  <Input
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                  {regErrors.name && <p className="text-xs font-medium text-destructive">{regErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">E-mail UFSC</label>
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="matricula@grad.ufsc.br"
                  />
                  {regErrors.email && <p className="text-xs font-medium text-destructive">{regErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  <Input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {regErrors.password && <p className="text-xs font-medium text-destructive">{regErrors.password}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Vínculo</label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    >
                      <option value="student">Estudante</option>
                      <option value="professor">Professor</option>
                      <option value="staff">Servidor</option>
                      <option value="alumni">Egresso</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ano de ingresso</label>
                    <Input
                      value={regEntryYear}
                      onChange={e => setRegEntryYear(e.target.value)}
                      placeholder="2024"
                      maxLength={4}
                    />
                    {regErrors.entryYear && <p className="text-xs font-medium text-destructive">{regErrors.entryYear}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Curso / Área</label>
                  <Input
                    value={regCourse}
                    onChange={e => setRegCourse(e.target.value)}
                    placeholder="ex: Ciência da Computação"
                  />
                  {regErrors.course && <p className="text-xs font-medium text-destructive">{regErrors.course}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Departamento / Centro</label>
                  <Input
                    value={regDepartment}
                    onChange={e => setRegDepartment(e.target.value)}
                    placeholder="ex: INE - CTC"
                  />
                  {regErrors.department && <p className="text-xs font-medium text-destructive">{regErrors.department}</p>}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={regLoading}>
                  {regLoading ? "Cadastrando..." : "Criar conta"}
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
        </div>
      </div>
    </div>
  );
}
