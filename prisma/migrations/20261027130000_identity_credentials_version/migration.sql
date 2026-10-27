-- Contador em vez de data: comparar versões não depende de relógio nem da ordem dos commits.
ALTER TABLE "user" DROP COLUMN "credentialsResetAt",
ADD COLUMN "credentialsVersion" INTEGER NOT NULL DEFAULT 0;
