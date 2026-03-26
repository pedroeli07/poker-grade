"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { importGradeFromJson } from "../actions";
import { ArrowLeft, Upload, FileJson, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";

const log = createLogger("grades.import");

export default function ImportGradePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      log.info("Iniciando import JSON da grade", { fileName: file.name });
      const text = await file.text();
      formData.append("jsonContent", text);

      await importGradeFromJson(formData);
      toast.success("Grade importada", "Redirecionando para a lista…");
      router.push("/dashboard/grades");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro desconhecido ao importar JSON";
      log.error("Erro na importação JSON (cliente)", err instanceof Error ? err : undefined);
      setError(msg);
      toast.error("Não foi possível importar", msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/grades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Importar Grade (Lobbyze)</h2>
          <p className="text-muted-foreground mt-1">
            Faça upload do arquivo JSON exportado da Lobbyze.
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Grade</CardTitle>
            <CardDescription>Esta grade base será convertida em regras.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Grade <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" required placeholder="Ex: Grade $11-$30 Regular" className="bg-background" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" name="description" placeholder="Ex: Grade principal para alunos do ABI 20" className="bg-background" />
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Arquivo JSON <span className="text-destructive">*</span></Label>
              
              <div className="border-2 border-dashed border-border/60 rounded-lg p-6 flex flex-col items-center justify-center bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-colors relative cursor-pointer group">
                <Input 
                  type="file" 
                  accept=".json" 
                  required 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-emerald-500">
                    <FileJson className="h-10 w-10 mb-2" />
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Upload className="h-10 w-10 mb-2 group-hover:text-primary transition-colors" />
                    <span className="font-medium text-sm">Clique ou arraste o JSON</span>
                    <span className="text-xs mt-1">Apenas arquivos .json suportados</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" asChild disabled={loading}>
              <Link href="/dashboard/grades">Cancelar</Link>
            </Button>
            <Button type="submit" className="glow-primary" disabled={!file || loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Importar Grade</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
