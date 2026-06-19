import { createFileRoute } from "@tanstack/react-router";
import { useDsV2 } from "@/hooks/useDsV2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Info, XCircle, Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/design-system")({
  head: () => ({
    meta: [{ title: "Design System — BanriTools" }],
  }),
  component: DesignSystemPage,
});

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-14 w-full rounded-md border border-border"
        style={{ background: value }}
        aria-label={name}
      />
      <div className="text-xs font-medium text-foreground">{name}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{value}</div>
    </div>
  );
}

function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function DesignSystemPage() {
  const { enabled, toggle } = useDsV2();

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6">
      {/* Header + toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Design System</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pré-visualização dos componentes com a paleta oficial (DS v2 ativo por padrão).
            Use o toggle para alternar entre o <strong>DS v2</strong> e o tema legado.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">DS v2</div>
            <div className="text-xs text-muted-foreground">{enabled ? "Ativo" : "Legado"}</div>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} aria-label="Alternar DS v2" />
        </label>
      </div>

      {/* Paleta semântica */}
      <Section title="Paleta semântica (tokens shadcn)" description="Reflete o que os componentes realmente consomem.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <Swatch name="background" value="var(--background)" />
          <Swatch name="card" value="var(--card)" />
          <Swatch name="secondary" value="var(--secondary)" />
          <Swatch name="muted" value="var(--muted)" />
          <Swatch name="border" value="var(--border)" />
          <Swatch name="foreground" value="var(--foreground)" />
          <Swatch name="primary" value="var(--primary)" />
          <Swatch name="accent" value="var(--accent)" />
          <Swatch name="ring" value="var(--ring)" />
          <Swatch name="success" value="var(--success)" />
          <Swatch name="warning" value="var(--warning)" />
          <Swatch name="destructive" value="var(--destructive)" />
          <Swatch name="brand-deep" value="var(--brand-deep)" />
          <Swatch name="brand-teal" value="var(--brand-teal)" />
          <Swatch name="brand-violet" value="var(--brand-violet)" />
          <Swatch name="sidebar" value="var(--sidebar)" />
          <Swatch name="sidebar-primary" value="var(--sidebar-primary)" />
          <Swatch name="sidebar-accent" value="var(--sidebar-accent)" />
        </div>
      </Section>

      {/* Tipografia */}
      <Section title="Tipografia" description="Exo 2 nos títulos, Source Sans 3 no corpo, Poppins exclusivo do logotipo.">
        <Card>
          <CardContent className="space-y-2 p-6">
            <h1 className="text-4xl font-bold text-foreground">Painel da Agência</h1>
            <h2 className="text-2xl font-semibold text-foreground">Ranking de junho</h2>
            <p className="text-base text-foreground">
              Cada lançamento de produção soma pontos para sua posição no mês.
            </p>
            <p className="text-sm text-muted-foreground">Texto secundário — instruções, legendas, descrições.</p>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eyebrow · resumo de hoje</div>
            <div className="font-mono text-3xl tabular-nums text-foreground">R$ 11.050,50</div>
          </CardContent>
        </Card>
      </Section>

      {/* Botões */}
      <Section title="Botões">
        <div className="flex flex-wrap gap-3">
          <Button>Salvar lançamento</Button>
          <Button variant="secondary">Ver metas</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="ghost">Exportar</Button>
          <Button variant="destructive">Excluir</Button>
          <Button variant="link">Saiba mais</Button>
          <Button disabled>Indisponível</Button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges & pílulas">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>+2.550 pts</Badge>
          <Badge variant="secondary">Time</Badge>
          <Badge variant="outline">Pendente</Badge>
          <Badge variant="destructive">Atrasado</Badge>
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">50 pts/unidade</span>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Sucesso</span>
          <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">Atenção</span>
          <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive">Erro</span>
        </div>
      </Section>

      {/* Avatares + progresso */}
      <Section title="Avatares & progresso">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar><AvatarFallback className="bg-primary text-primary-foreground">AB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="bg-brand-teal text-white">MP</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="bg-brand-violet text-white">RS</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="bg-brand-deep text-white"><Trophy className="h-4 w-4" /></AvatarFallback></Avatar>
        </div>
        <div className="space-y-3">
          <Progress value={32} />
          <Progress value={68} />
          <Progress value={96} />
        </div>
      </Section>

      {/* Formulário */}
      <Section title="Campos de formulário">
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" placeholder="1.250,00" defaultValue="1.250,00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metrica">Tipo de métrica</Label>
              <Select defaultValue="qtd-valor">
                <SelectTrigger id="metrica"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="qtd">Quantidade</SelectItem>
                  <SelectItem value="valor">Valor</SelectItem>
                  <SelectItem value="qtd-valor">Quantidade + Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Checkbox id="bio" defaultChecked /><Label htmlFor="bio">Utilizar biometria</Label></div>
            <div className="flex items-center gap-2"><Switch id="notif" defaultChecked /><Label htmlFor="notif">Notificações</Label></div>
          </CardContent>
        </Card>
      </Section>

      {/* Tabs + Alerts */}
      <Section title="Navegação & feedback">
        <Tabs defaultValue="hoje">
          <TabsList>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
          <TabsContent value="hoje" className="pt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Próxima melhor ação</AlertTitle>
              <AlertDescription>Você está a 2 vendas de Seguro Vida para bater a meta diária.</AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="semana" className="pt-4 space-y-3">
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle>Meta atualizada</AlertTitle>
              <AlertDescription>A meta de junho foi revisada pela gestão.</AlertDescription>
            </Alert>
            <Alert>
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>3 registros pendentes de aprovação.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Falha ao sincronizar produção. Tente novamente.</AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="mes" className="pt-4 text-sm text-muted-foreground">Conteúdo do mês.</TabsContent>
        </Tabs>
      </Section>

      {/* Cards & ranking row */}
      <Section title="Cards & ranking">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card padrão</CardTitle>
              <CardDescription>Superfície base com borda e sombra curta.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground">Conteúdo do card aqui.</CardContent>
          </Card>
          <Card className="border-success/40 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-success" /> Destaque</CardTitle>
              <CardDescription>Variante de sucesso/destaque.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground">+2.550 pts esta semana.</CardContent>
          </Card>
          <Card className="bg-brand-deep text-white">
            <CardHeader>
              <CardTitle className="text-white">Marca institucional</CardTitle>
              <CardDescription className="text-white/70">brand-deep (#000050)</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-white/90">Use em heros e cabeçalhos de marca.</CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="divide-y divide-border p-0">
            {[
              { pos: 1, name: "Ana Borges", pts: 4820 },
              { pos: 2, name: "Marcos Pires", pts: 4310 },
              { pos: 3, name: "Renata Silva", pts: 3990 },
            ].map((r) => (
              <div key={r.pos} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-semibold text-foreground">{r.pos}</span>
                  <Avatar><AvatarFallback>{r.name.split(" ").map(s => s[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                  <span className="font-medium text-foreground">{r.name}</span>
                </div>
                <Badge>{r.pts.toLocaleString("pt-BR")} pts</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Skeleton */}
      <Section title="Skeleton">
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </Section>

      <Separator />
      <p className="text-xs text-muted-foreground">
        Dica: alterne tema claro/escuro pela sidebar enquanto o DS v2 está ativo para validar as duas variantes.
      </p>
    </div>
  );
}
