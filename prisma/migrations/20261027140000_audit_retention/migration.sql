-- Retenção da auditoria: 6 meses (Marco Civil, art. 15; decisão do usuário em 2026-10-27).
-- Alterar continua proibido; apagar só o que já passou do prazo (a limpeza diária). O banco garante, não a aplicação.
CREATE OR REPLACE FUNCTION "audit_log_append_only"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD."createdAt" < now() - interval '6 months' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'audit_log aceita só inserção (e exclusão depois de 6 meses)';
END;
$$;
