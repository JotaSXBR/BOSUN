/** Lista dos códigos de recuperação (setup do 2FA e tela de segurança). */
export function CodesList({ codes }: { codes: string[] }) {
  return (
    <ul aria-label="Códigos de recuperação">
      {codes.map((code) => (
        <li key={code}>
          <code>{code}</code>
        </li>
      ))}
    </ul>
  );
}
