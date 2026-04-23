import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TeamAdminPageProps = {
  title: string;
  lead: string;
  sectionLabel: string;
};

export function TeamAdminPage({ title, lead, sectionLabel }: TeamAdminPageProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-3xl font-bold tracking-tight text-primary">{title}</h2>
          <Badge variant="secondary" className="font-normal">
            {sectionLabel}
          </Badge>
        </div>
        <p className="text-muted-foreground">{lead}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Área reservada</CardTitle>
          <CardDescription>
            UI completa em desenvolvimento. A lógica de servidor e revalidação desta secção vivem em{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/queries/db/team</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          As rotas correspondem a <code className="text-xs">lib/constants/team/paths.ts</code> para cache e
          revalidação após mutações.
        </CardContent>
      </Card>
    </div>
  );
}
