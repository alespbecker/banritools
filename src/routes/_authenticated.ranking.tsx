import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — BanriTools" },
      { name: "description", content: "Ranking de produção da agência" },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Ranking</h1>
        <p className="text-sm text-muted-foreground">Ranking de produção da agência</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Ranking será disponibilizado para administradores em breve</p>
        </div>
      </div>
    </>
  );
}
