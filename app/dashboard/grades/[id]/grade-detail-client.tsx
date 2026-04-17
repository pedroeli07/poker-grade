"use client";

import Link from "next/link";
import { ArrowLeft, Pencil, Plus, X, Check, Loader2 } from "lucide-react";
import { useGradeDetailPage } from "@/hooks/grades/use-grade-detail-page";
import type { GradeDetailQueryData } from "@/lib/types";
import { cardClassName } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { memo, lazy, Suspense } from "react";
import { useEditableGradeNote } from "@/hooks/grades/use-editable-grade-note";

// Lazy-loaded: only shown when grade has a description, or user opens edit mode
const GradeDetailHeroDescription = lazy(() => import("@/components/grades/grade-detail-hero-description"));
const GradeRuleCard = lazy(() => import("@/components/grades/grade-rule-card"));
// Lazy-loaded: heavy WYSIWYG editor (Tiptap/Quill bundle)
const RichTextEditor = lazy(() => import("@/components/grades/rich-text-editor"));


const GradeDetailClient = memo(({
  gradeId,
  initialData,
}: {
  gradeId: string;
  initialData: GradeDetailQueryData;
}) => {
  const { data } = useGradeDetailPage(gradeId, initialData);
  
  const {
    isEditing,
    editContent,
    saving,
    setEditContent,
    actions: { handleEdit, handleCancel, handleSave }
  } = useEditableGradeNote(gradeId, data.description ?? null);

  const showDescriptionSection = data.description || data.canEditNote;

  return (
    <div className="w-full space-y-3 pb-2">
      <div className="relative w-full overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card from-40% via-card to-muted/35 shadow-sm ring-1 ring-border/30">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="relative z-10 space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-2.5 border-b border-border/50 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
            <Button variant="ghost" size="sm" asChild className="h-8 w-fit shrink-0 -ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/grades" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <h1 className="min-w-0 flex-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <span className="block [overflow-wrap:anywhere] sm:truncate">{data.name}</span>
            </h1>
            <span className="inline-flex h-7 w-fit shrink-0 items-center rounded-full border border-primary/25 bg-primary/[0.08] px-3 text-xs font-semibold text-primary sm:ml-auto">
              {data.rules.length} regra{data.rules.length !== 1 ? "s" : ""} nesta grade
            </span>
          </div>

          {showDescriptionSection && (
            <div className="rounded-lg border border-border/60 bg-background/80 p-3 shadow-inner sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Descrição e regras gerais
                </h2>
                {data.canEditNote && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {data.description ? (
                      <><Pencil className="h-3 w-3" /> Editar</>
                    ) : (
                      <><Plus className="h-3 w-3" /> Adicionar descrição</>
                    )}
                  </Button>
                )}
                {data.canEditNote && isEditing && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="h-7 gap-1 text-xs"
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted/30" />}>
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    minHeight="180px"
                  />
                </Suspense>
              ) : data.description ? (
                <div className="max-h-[min(42vh,26rem)] overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                  <GradeDetailHeroDescription text={data.description} />
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground/60">
                  Nenhuma descrição adicionada ainda.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid auto-rows-fr gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {data.rules.length === 0 ? (
          <div className={`${cardClassName} col-span-full py-8 text-center text-muted-foreground text-sm`}>
            Nenhuma regra nesta grade.
          </div>
        ) : (
          data.rules.map((rule, idx) => (
            <GradeRuleCard
              key={rule.id}
              rule={rule}
              idx={idx}
              manage={data.manageRules}
              gradeProfileId={gradeId}
            />
          ))
        )}
      </div>
    </div>
  );
});

GradeDetailClient.displayName = "GradeDetailClient";

export default GradeDetailClient;
