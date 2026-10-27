-- Um TwoFactor por usuário: corrida no enable do plugin vira erro, não linha duplicada.
DROP INDEX "twoFactor_userId_idx";
CREATE UNIQUE INDEX "twoFactor_userId_key" ON "twoFactor"("userId");

-- E-mail e usuário em minúsculas, inclusive em escrita direta pelo Prisma (CLI).
ALTER TABLE "user" ADD CONSTRAINT "user_email_lowercase" CHECK ("email" = lower("email"));
ALTER TABLE "user" ADD CONSTRAINT "user_username_lowercase" CHECK ("username" = lower("username"));

-- Auditoria só aceita inserção (ASVS 16).
CREATE FUNCTION "audit_log_append_only"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log aceita só inserção';
END;
$$;
CREATE TRIGGER "audit_log_no_update_delete" BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION "audit_log_append_only"();
