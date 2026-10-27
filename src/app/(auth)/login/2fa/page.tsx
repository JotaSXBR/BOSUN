import Link from "next/link";
import { ChallengeForms } from "./challenge-forms.tsx";

export const metadata = { title: "Verificação em duas etapas · BOSUN" };

export default function TwoFactorChallengePage() {
  return (
    <main>
      <h1>Verificação em duas etapas</h1>
      <p>Digite o código de 6 dígitos do seu app autenticador.</p>
      <ChallengeForms />
      <p>
        <Link href="/login">Voltar ao login</Link>
      </p>
    </main>
  );
}
