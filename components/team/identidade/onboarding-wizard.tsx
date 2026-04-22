"use client";

import { useMemo, useState, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import {
  ONBOARDING_COMMITMENTS,
  ONBOARDING_QUIZ_QUESTIONS,
  ONBOARDING_STEP_LABELS,
} from "@/lib/constants/team/onboarding";
import { getOnboardingOptionClass } from "@/lib/utils/onboarding-quiz-options";
import { cn } from "@/lib/utils/cn";

type Props = {
  valueCount: number;
  mandatoryRuleCount: number;
  recommendationRuleCount: number;
};

const OnboardingWizard = memo(function OnboardingWizard({
  valueCount,
  mandatoryRuleCount,
  recommendationRuleCount,
}: Props) {
  const [step, setStep] = useState(1);
  const [hasRead, setHasRead] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const summaryItems = useMemo(
    () => [
      `${valueCount} valor(es) na identidade`,
      `${mandatoryRuleCount} regra(s) obrigatória(s)`,
      `${recommendationRuleCount} recomendação(ões)`,
      "Consequências claras para cada regra (definidas no time)",
    ],
    [valueCount, mandatoryRuleCount, recommendationRuleCount],
  );

  const score = useMemo(() => {
    const correct = ONBOARDING_QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correctAnswer).length;
    const total = ONBOARDING_QUIZ_QUESTIONS.length;
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
      passed: correct / total >= 0.8,
    };
  }, [answers]);

  const allAnswered = Object.keys(answers).length === ONBOARDING_QUIZ_QUESTIONS.length;

  return (
    <div className="mt-6 space-y-6 pb-12">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Onboarding cultural</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Antes de operar, cada jogador deve completar o onboarding cultural.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
          {step === 4 ? (
            <>
              <Unlock className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400">Grind liberado</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Grind bloqueado
            </>
          )}
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Progresso do onboarding</span>
          <span className="font-bold text-muted-foreground">{step * 25}%</span>
        </div>
        <Progress
          value={step * 25}
          className="h-2 bg-muted transition-all duration-500 [&>div]:bg-primary"
        />
        <div className="mt-2 flex justify-between px-1 text-xs font-medium text-muted-foreground">
          {ONBOARDING_STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={step >= i + 1 ? "font-bold text-primary" : ""}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-foreground" />
            <h4 className="text-lg font-bold">Leitura obrigatória da cultura</h4>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Leia atentamente as abas de identidade, valores e regras.
          </p>
          <div className="mb-6 rounded-xl border bg-muted/30 p-6">
            <h5 className="mb-3 font-bold text-foreground">Resumo do que você precisa saber</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {summaryItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6 flex items-center gap-3 p-2">
            <Checkbox
              id="read-confirm"
              checked={hasRead}
              onCheckedChange={(c) => setHasRead(c === true)}
              className="h-5 w-5"
            />
            <label htmlFor="read-confirm" className="cursor-pointer text-sm font-medium text-foreground">
              Li e compreendi a cultura do time apresentada nesta página
            </label>
          </div>
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={!hasRead}
            onClick={() => setStep(2)}
          >
            Continuar para aceite formal <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-foreground" />
            <h4 className="text-lg font-bold">Aceite formal</h4>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Ao aceitar, você se compromete a seguir regras e valores do time.
          </p>
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
            <h5 className="mb-4 font-bold">Eu me comprometo a</h5>
            <ul className="space-y-3">
              {ONBOARDING_COMMITMENTS.map((c) => (
                <li key={c} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6 flex items-center gap-3 p-2">
            <Checkbox
              id="accept-confirm"
              checked={hasAccepted}
              onCheckedChange={(c) => setHasAccepted(c === true)}
              className="h-5 w-5"
            />
            <label htmlFor="accept-confirm" className="cursor-pointer text-sm font-medium text-foreground">
              Aceito formalmente os termos e compromissos acima
            </label>
          </div>
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={!hasAccepted}
            onClick={() => setStep(3)}
          >
            Continuar para o quiz <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-foreground" />
            <h4 className="text-lg font-bold">Quiz de entendimento</h4>
          </div>
          <p className="mb-6 border-b pb-4 text-sm text-muted-foreground">
            Responda corretamente pelo menos 80% das perguntas para liberar o grind.
          </p>

          {isQuizSubmitted && (
            <div
              className={cn(
                "mb-8 flex flex-col items-center justify-center rounded-xl border p-6 text-center",
                score.passed
                  ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/40"
                  : "border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/40",
              )}
            >
              {score.passed ? (
                <>
                  <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500" />
                  <h5 className="mb-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">Aprovado</h5>
                </>
              ) : (
                <>
                  <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                  <h5 className="mb-1 text-lg font-bold text-red-600 dark:text-red-400">Tente novamente</h5>
                </>
              )}
              <p
                className={cn(
                  "text-sm font-medium",
                  score.passed ? "text-emerald-600/90 dark:text-emerald-300/90" : "text-red-600/90 dark:text-red-300/90",
                )}
              >
                Você acertou {score.correct}/{score.total} ({score.percentage}%)
              </p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  score.passed ? "text-emerald-600/70" : "text-red-600/70",
                )}
              >
                {score.passed ? "Ótimo entendimento da cultura." : "Mínimo necessário: 80%"}
              </p>
            </div>
          )}

          <div className="mb-8 space-y-6">
            {ONBOARDING_QUIZ_QUESTIONS.map((q) => {
              const isAnswered = answers[q.id] !== undefined;
              const isQCorrect = answers[q.id] === q.correctAnswer;
              const showResult = isQuizSubmitted;
              const cardClass = cn(
                "rounded-xl border p-5 transition-all duration-200",
                !showResult &&
                  (isAnswered ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-primary/20"),
                showResult &&
                  (isQCorrect
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                    : "border-red-200 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/25"),
              );

              return (
                <div key={q.id} className={cardClass}>
                  <h6 className="mb-4 text-sm font-bold text-foreground">
                    {q.id}. {q.question}
                  </h6>
                  <div className="mb-4 space-y-2.5">
                    {q.options.map((option, idx) => {
                      const isSelected = answers[q.id] === option;
                      const isOptCorrect = option === q.correctAnswer;
                      return (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (!isQuizSubmitted) {
                                setAnswers((prev) => ({ ...prev, [q.id]: option }));
                              }
                            }
                          }}
                          className={getOnboardingOptionClass(
                            isSelected,
                            isOptCorrect,
                            showResult,
                            isQCorrect,
                          )}
                          onClick={() => {
                            if (!isQuizSubmitted) {
                              setAnswers((prev) => ({ ...prev, [q.id]: option }));
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              isSelected ? "border-primary" : "border-muted-foreground/40",
                            )}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <span className="text-sm font-medium text-foreground">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                  {showResult && (
                    <div className="mt-4 border-t border-border/60 pt-4">
                      {isQCorrect ? (
                        <>
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> Correto
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                          Resposta incorreta.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isQuizSubmitted ? (
            <Button
              className="h-12 w-full text-base font-semibold"
              disabled={!allAnswered}
              onClick={() => setIsQuizSubmitted(true)}
            >
              Enviar respostas
            </Button>
          ) : !score.passed ? (
            <Button
              className="h-12 w-full text-base font-semibold"
              onClick={() => {
                setAnswers({});
                setIsQuizSubmitted(false);
              }}
            >
              Tentar novamente
            </Button>
          ) : (
            <Button
              className="h-12 w-full bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
              onClick={() => setStep(4)}
            >
              Concluir onboarding <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col items-center rounded-xl border bg-muted/20 py-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-500 shadow-sm dark:border-emerald-800 dark:bg-emerald-950">
            <Unlock className="ml-1 h-10 w-10" />
          </div>
          <h4 className="mb-3 text-2xl font-bold">Grind liberado</h4>
          <p className="mb-8 max-w-md font-medium text-muted-foreground">
            Você concluiu o onboarding e demonstrou entendimento das regras e valores do time.
          </p>
          <Button className="h-12 px-8 text-base font-semibold" asChild>
            <Link href="/admin/dashboard">Ir para o painel</Link>
          </Button>
        </div>
      )}
    </div>
  );
});

OnboardingWizard.displayName = "OnboardingWizard";

export default OnboardingWizard;
