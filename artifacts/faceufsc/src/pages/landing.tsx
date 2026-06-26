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

const loginSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail UFSC valido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function Landing() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    setLocation("/feed");
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

      <div className="flex-1 bg-background flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Entre na sua conta UFSC</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="matricula@grad.ufsc.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>Acesso restrito a estudantes, docentes e egressos da UFSC.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
