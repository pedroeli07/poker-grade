-- team_dri
ALTER TABLE "team_dri" RENAME COLUMN "regras" TO "rules";
ALTER TABLE "team_dri" RENAME COLUMN "responsavelNome" TO "responsibleName";

-- team_decisions
ALTER TABLE "team_decisions" RENAME COLUMN "titulo" TO "title";
ALTER TABLE "team_decisions" RENAME COLUMN "resumo" TO "summary";
ALTER TABLE "team_decisions" RENAME COLUMN "impacto" TO "impact";
ALTER TABLE "team_decisions" RENAME COLUMN "autorId" TO "authorId";
ALTER TABLE "team_decisions" RENAME COLUMN "visibilidade" TO "visibility";
ALTER TABLE "team_decisions" RENAME COLUMN "data" TO "decidedAt";
UPDATE "team_decisions" SET "status" = 'PENDING' WHERE "status" = 'Pendente';
UPDATE "team_decisions" SET "visibility" = 'ALL' WHERE "visibility" = 'Todos';

-- team_rituals
ALTER TABLE "team_rituals" RENAME COLUMN "nome" TO "name";
ALTER TABLE "team_rituals" RENAME COLUMN "tipo" TO "ritualType";
ALTER TABLE "team_rituals" RENAME COLUMN "descricao" TO "description";
ALTER TABLE "team_rituals" RENAME COLUMN "responsavelNome" TO "responsibleName";
ALTER TABLE "team_rituals" RENAME COLUMN "pauta" TO "agenda";
ALTER TABLE "team_rituals" RENAME COLUMN "dataInicial" TO "startAt";
ALTER TABLE "team_rituals" RENAME COLUMN "duracaoMin" TO "durationMin";
ALTER TABLE "team_rituals" RENAME COLUMN "recorrencia" TO "recurrence";

-- team_ritual_executions
ALTER TABLE "team_ritual_executions" RENAME COLUMN "data" TO "executedAt";
ALTER TABLE "team_ritual_executions" RENAME COLUMN "observacoes" TO "notes";
ALTER TABLE "team_ritual_executions" RENAME COLUMN "presencas" TO "attendance";

-- team_ritual_participations
ALTER TABLE "team_ritual_participations" RENAME COLUMN "presente" TO "attended";
ALTER TABLE "team_ritual_participations" RENAME COLUMN "data" TO "attendedAt";

-- team_tasks
ALTER TABLE "team_tasks" RENAME COLUMN "titulo" TO "title";
ALTER TABLE "team_tasks" RENAME COLUMN "descricao" TO "description";
ALTER TABLE "team_tasks" RENAME COLUMN "prioridade" TO "priority";
ALTER TABLE "team_tasks" RENAME COLUMN "resultadoEsperado" TO "expectedResult";
ALTER TABLE "team_tasks" RENAME COLUMN "criterios" TO "criteria";
ALTER TABLE "team_tasks" RENAME COLUMN "responsavelNome" TO "responsibleName";
ALTER TABLE "team_tasks" RENAME COLUMN "prazo" TO "dueAt";
ALTER TABLE "team_tasks" RENAME COLUMN "ritualOrigemId" TO "sourceRitualId";
ALTER TABLE "team_tasks" RENAME COLUMN "decisaoOrigemId" TO "sourceDecisionId";
UPDATE "team_tasks" SET "status" = 'TODO' WHERE "status" = 'A Fazer';

-- team_alert_rules
ALTER TABLE "team_alert_rules" RENAME COLUMN "nome" TO "name";
ALTER TABLE "team_alert_rules" RENAME COLUMN "metrica" TO "metric";
ALTER TABLE "team_alert_rules" RENAME COLUMN "operador" TO "operator";
ALTER TABLE "team_alert_rules" RENAME COLUMN "limite" TO "threshold";
ALTER TABLE "team_alert_rules" RENAME COLUMN "severidade" TO "severity";
ALTER TABLE "team_alert_rules" RENAME COLUMN "responsavelNome" TO "responsibleName";

-- team_indicators
ALTER TABLE "team_indicators" RENAME COLUMN "nome" TO "name";
ALTER TABLE "team_indicators" RENAME COLUMN "meta" TO "targetValue";
ALTER TABLE "team_indicators" RENAME COLUMN "frequencia" TO "frequency";
ALTER TABLE "team_indicators" RENAME COLUMN "responsavelNome" TO "responsibleName";
ALTER TABLE "team_indicators" RENAME COLUMN "tipoCurva" TO "curveType";
ALTER TABLE "team_indicators" RENAME COLUMN "unidade" TO "unit";
ALTER TABLE "team_indicators" RENAME COLUMN "valorAtual" TO "currentValue";
ALTER TABLE "team_indicators" RENAME COLUMN "acaoAutomatica" TO "autoAction";
ALTER TABLE "team_indicators" RENAME COLUMN "definicao" TO "definition";
ALTER TABLE "team_indicators" RENAME COLUMN "fonteDados" TO "dataSource";
ALTER TABLE "team_indicators" RENAME COLUMN "glossario" TO "glossary";
ALTER TABLE "team_indicators" RENAME COLUMN "linkFonte" TO "sourceUrl";
ALTER TABLE "team_indicators" RENAME COLUMN "tipo" TO "resultType";
UPDATE "team_indicators" SET "area" = 'General' WHERE "area" = 'Geral';
UPDATE "team_indicators" SET "frequency" = 'WEEKLY' WHERE "frequency" = 'Semanal';
UPDATE "team_indicators" SET "status" = 'ON_TARGET' WHERE "status" = 'No alvo';
UPDATE "team_indicators" SET "curveType" = 'RISING' WHERE "curveType" = 'Crescente';
UPDATE "team_indicators" SET "autoAction" = 'NONE' WHERE "autoAction" = 'Nenhuma';
UPDATE "team_indicators" SET "dataSource" = 'MANUAL' WHERE "dataSource" = 'Manual';
UPDATE "team_indicators" SET "resultType" = 'OUTCOME' WHERE "resultType" = 'Resultado';
