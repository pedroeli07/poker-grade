"use client";

import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { governanceAreaBadgeCls } from "@/lib/constants/team/governance-ui";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";

export type GovernanceDriMatrixSectionProps = {
  dris: GovernanceDriDTO[];
  onConfigure: () => void;
  onEdit: (dri: GovernanceDriDTO) => void;
  onRequestDelete: (id: string) => void;
};

export function GovernanceDriMatrixSection({ dris, onConfigure, onEdit, onRequestDelete }: GovernanceDriMatrixSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Matriz de responsabilidades (DRI)</CardTitle>
            <CardDescription>
              DRI = Directly Responsible Individual — quem responde por cada área.
            </CardDescription>
          </div>
          <Button type="button" variant="default" className="gap-2" onClick={onConfigure}>
            <Plus className="h-4 w-4" /> Configurar área
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Área", "Responsável (DRI)", "Regras de escalação", "Ações"].map((h) => (
                  <TableHead key={h} className={h === "Ações" ? "text-right" : ""}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dris.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    Nenhum DRI cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                dris.map((dri) => (
                  <TableRow key={dri.id}>
                    <TableCell>
                      <Badge variant="outline" className={governanceAreaBadgeCls(dri.area)}>
                        {dri.area}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-background">
                          {(dri.user?.displayName || dri.responsibleName || "NA")
                            .split(/\s+/)
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium">
                          {dri.user?.displayName || dri.responsibleName || "Responsável não definido"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">{dri.rules}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          onEdit(dri);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onRequestDelete(dri.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
