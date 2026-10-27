import Link from "next/link";
import { ForgotForm } from "./forgot-form.tsx";

export const metadata = { title: "Esqueci a senha · BOSUN" };

export default function ForgotPage() {
  return (
    <main>
      <h1>Esqueci a senha</h1>
      <p>A BOSUN não envia e-mail. O pedido vai para a Admin do seu workspace, que entrega uma senha temporária.</p>
      <ForgotForm />
      <p>
        <Link href="/login">Voltar ao login</Link>
      </p>
    </main>
  );
}
