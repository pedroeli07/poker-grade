-- Normalize rule type codes to English (was OBRIGATORIA / RECOMENDACAO).
UPDATE "team_operational_rules" SET "tipo" = 'MANDATORY' WHERE "tipo" = 'OBRIGATORIA';
UPDATE "team_operational_rules" SET "tipo" = 'RECOMMENDATION' WHERE "tipo" = 'RECOMENDACAO';
