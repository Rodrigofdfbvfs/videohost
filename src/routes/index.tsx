import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Play, Volume2, Code2, Zap, Lock, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg">VSLHost</span>
          </div>
          <Link to="/auth" className="px-5 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition">
            Entrar
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <section className="py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border/50 text-sm text-muted-foreground mb-8">
            <Zap className="w-3.5 h-3.5 text-accent" /> Player de VSL de alta conversão
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
            Hospede suas VSLs <br />
            com player <span className="text-gradient">otimizado</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload do vídeo, edite as configurações de conversão e cole o código na sua página de vendas. Simples assim.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link to="/auth" className="px-7 py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition">
              Começar grátis
            </Link>
          </div>
        </section>

        <section className="py-20 grid sm:grid-cols-3 gap-5">
          {[
            { icon: Volume2, t: "Click-to-listen", d: 'Adesivo "Vídeo já começou. Clique para ouvir" que dispara o áudio.' },
            { icon: Lock, t: "Controles bloqueados", d: "Player sem pause, sem seek. Foco total na mensagem." },
            { icon: Code2, t: "Código embed", d: "Copie e cole o snippet em qualquer página de vendas." },
            { icon: Zap, t: "CTA com delay", d: "Botão de compra aparece no momento certo do vídeo." },
            { icon: BarChart3, t: "Storage rápido", d: "Vídeos hospedados em CDN com entrega mundial." },
            { icon: Play, t: "Player customizável", d: "Cor, texto e timing do CTA editáveis em segundos." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-6 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition">
              <Icon className="w-6 h-6 text-accent" />
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VSLHost — Hospedagem profissional para VSLs
      </footer>
    </div>
  );
}
