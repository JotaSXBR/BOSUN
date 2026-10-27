import type { NextConfig } from "next";

// Cabeçalhos de segurança básicos em toda resposta. A CSP com nonce fica no src/proxy.ts (muda a cada requisição).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Só em produção: em dev o localhost é HTTP. Sem includeSubDomains, porque o domínio é da cliente.
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
];

const nextConfig: NextConfig = {
  // agentRules: o AGENTS.md é do projeto; o next dev não deve reescrevê-lo.
  agentRules: false,
  poweredByHeader: false,
  headers: async () => [
    { source: "/(.*)", headers: securityHeaders },
    // API devolve JSON (e o 404 em HTML): nada a carregar nem a emoldurar.
    { source: "/api/:path*", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" }] },
  ],
};

export default nextConfig;
