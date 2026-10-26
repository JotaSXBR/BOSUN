import { LoginForm } from "./login-form.tsx";

export const metadata = { title: "Entrar · BOSUN" };

export default function LoginPage() {
  return (
    <main>
      <h1>Entrar na BOSUN</h1>
      <LoginForm />
    </main>
  );
}
