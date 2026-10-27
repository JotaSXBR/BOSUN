-- Marco da última senha temporária (corrida login × reset) e do último unlock (aviso no setup do 2FA).
ALTER TABLE "user" ADD COLUMN "credentialsResetAt" TIMESTAMP(3),
ADD COLUMN "twoFactorResetAt" TIMESTAMP(3);
