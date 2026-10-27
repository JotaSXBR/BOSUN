/** "Sair" visível em toda página autenticada (ADR-102): POST com Origin, a rota apaga a sessão. */
export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button type="submit">Sair</button>
    </form>
  );
}
