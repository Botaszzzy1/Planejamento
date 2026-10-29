import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/jurua-logo.png.asset.json";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar · Área de Planejamento" },
      { name: "description", content: "Acesse o quadro de ocorrências diárias da equipe de planejamento." },
      { property: "og:title", content: "Área de Planejamento" },
      { property: "og:description", content: "Acompanhe as ocorrências diárias da equipe de planejamento." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/quadro" }); });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/quadro" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Cadastro enviado! Aguarde a aprovação do administrador para acessar.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="w-full max-w-md">
        <img src={logo.url} alt="Juruá" className="mx-auto mb-6 h-16 w-auto" />
        <div className="rounded-2xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Área de Planejamento</h1>
            <p className="text-sm text-muted-foreground">Ocorrências diárias da equipe</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && (
            <div className="space-y-1.5"><Label>Nome completo</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          )}
          <div className="space-y-1.5"><Label>E-mail</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Senha</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full bg-brand shadow-glow" disabled={busy}>
            {mode === "in" ? "Entrar" : "Solicitar acesso"}
          </Button>
        </form>
        <button className="mt-4 w-full text-center text-sm text-primary hover:underline"
          onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Não tem acesso? Solicite seu cadastro" : "Já tenho conta — entrar"}
        </button>
        </div>
      </div>
    </div>
  );
}
