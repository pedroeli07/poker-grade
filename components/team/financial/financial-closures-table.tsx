"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FinancialClosuresTableProps } from "@/lib/types/team/financial";

export const FinancialClosuresTable = memo(function FinancialClosuresTable({ rows }: FinancialClosuresTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos fechamentos mensais</CardTitle>
        <CardDescription>Resumo dos últimos meses de operação do time (ilustrativo).</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 font-semibold">Mês/ano</TableHead>
              <TableHead className="font-semibold">Lucro bruto</TableHead>
              <TableHead className="font-semibold">Repasse jogadores</TableHead>
              <TableHead className="font-semibold">Despesas (softwares/coach)</TableHead>
              <TableHead className="pr-6 text-right font-semibold">Lucro líquido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.monthLabel}>
                <TableCell className="px-6 font-medium">{row.monthLabel}</TableCell>
                <TableCell>{row.gross}</TableCell>
                <TableCell>{row.playerShare}</TableCell>
                <TableCell>{row.expenses}</TableCell>
                <TableCell
                  className={
                    row.status === "positive"
                      ? "pr-6 text-right font-bold text-emerald-600"
                      : "pr-6 text-right font-bold text-red-600"
                  }
                >
                  {row.net}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

FinancialClosuresTable.displayName = "FinancialClosuresTable";
