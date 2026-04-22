-- Team operational rules: normalize severity codes, then rename columns to English
UPDATE "team_operational_rules" SET
  "severidade" = CASE
    WHEN "severidade" IS NULL OR BTRIM(COALESCE("severidade"::text, '')) = '' THEN 'NONE'
    WHEN "severidade" = 'NENHUM' THEN 'NONE'
    WHEN "severidade" = 'CRITICO' THEN 'CRITICAL'
    WHEN "severidade" = 'ATENCAO' THEN 'WARNING'
    WHEN "severidade" = 'ALERTA' THEN 'ALERT'
    WHEN "severidade" = 'INFO' THEN 'INFO'
    ELSE "severidade"::text
  END;

ALTER TABLE "team_operational_rules" RENAME COLUMN "titulo" TO "title";
ALTER TABLE "team_operational_rules" RENAME COLUMN "descricao" TO "description";
ALTER TABLE "team_operational_rules" RENAME COLUMN "tipo" TO "type";
ALTER TABLE "team_operational_rules" RENAME COLUMN "monitoramento" TO "monitoring";
ALTER TABLE "team_operational_rules" RENAME COLUMN "fonte" TO "source";
ALTER TABLE "team_operational_rules" RENAME COLUMN "limite" TO "limit";
ALTER TABLE "team_operational_rules" RENAME COLUMN "consequencia" TO "consequence";
ALTER TABLE "team_operational_rules" RENAME COLUMN "ativa" TO "active";
ALTER TABLE "team_operational_rules" RENAME COLUMN "severidade" TO "severity";

-- Team culture: migrate JSON keys inside valores, then rename columns
UPDATE "team_culture"
SET
  "valores" = COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', e->'titulo',
          'description', e->'descricao',
          'whatWeDo', e->'oQueFazemos',
          'whatWeDont', e->'oQueNaoFazemos',
          'metrics',
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object('title', m->'titulo', 'description', m->'descricao', 'source', m->'fonte')
              )
              FROM jsonb_array_elements(COALESCE(e->'metricas', '[]'::jsonb)) AS m
            ),
            '[]'::jsonb
          )
        )
      )
      FROM jsonb_array_elements("valores"::jsonb) AS t(e)
    ),
    '[]'::jsonb
  );

ALTER TABLE "team_culture" RENAME COLUMN "proposito" TO "purpose";
ALTER TABLE "team_culture" RENAME COLUMN "visao" TO "vision";
ALTER TABLE "team_culture" RENAME COLUMN "missao" TO "mission";
ALTER TABLE "team_culture" RENAME COLUMN "valores" TO "values";
