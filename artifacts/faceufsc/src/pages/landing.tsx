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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

const loginSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Insira um e-mail válido." }).refine(
    e => ["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"].some(d => e.endsWith(d)),
    { message: "Use um e-mail institucional da UFSC." }
  ),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  course: z.string().min(2, { message: "Informe seu curso ou área." }),
  department: z.string().min(2, { message: "Informe seu departamento." }),
  entryYear: z.string().min(4, { message: "Informe o ano de ingresso." }),
  role: z.string().min(1, { message: "Selecione seu vínculo." }),
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

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", email: "", password: "", course: "",
      department: "", entryYear: new Date().getFullYear().toString(), role: "student",
    },
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      await login(values.email, values.password);
      setLocation("/feed");
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err.message, variant: "destructive" });
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    try {
      await register(values);
      setLocation("/feed");
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar", description: err.message, variant: "destructive" });
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

      <div className="flex-1 bg-background flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 items-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-6"
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
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail UFSC</FormLabel>
                        <FormControl>
                          <Input placeholder="matricula@grad.ufsc.br" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vínculo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Estudante</SelectItem>
                              <SelectItem value="professor">Professor</SelectItem>
                              <SelectItem value="staff">Servidor</SelectItem>
                              <SelectItem value="alumni">Egresso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="entryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano de ingresso</FormLabel>
                          <FormControl>
                            <Input placeholder="2024" maxLength={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curso / Área</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Ciência da Computação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento / Centro</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: INE - CTC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={registerForm.formState.isSubmitting}>
                    {registerForm.formState.isSubmitting ? "Cadastrando..." : "Criar conta"}
                  </Button>
                </form>
              </Form>
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
