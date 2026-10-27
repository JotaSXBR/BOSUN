-- Versão da credencial (sobe a cada troca de senha ou senha temporária; o login que leu outra versão não vira sessão)
-- e data do último `admin unlock` (o setup do 2FA avisa a pessoa).
ALTER TABLE "user" ADD COLUMN "credentialsVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "twoFactorResetAt" TIMESTAMP(3);
