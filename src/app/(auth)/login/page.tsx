import Link from "next/link";
import { LoginForm } from "./login-form.tsx";

export const metadata = { title: "Entrar · BOSUN" };

export default function LoginPage() {
  return (
    <main>
      <h1>Entrar na BOSUN</h1>
      <LoginForm />
      <p>
        <Link href="/login/forgot">Esqueci a senha</Link>
      </p>
    </main>
  );
}
