import type { NextConfig } from "next";

// Cabeçalhos de segurança básicos em toda resposta. A CSP com nonce entra no módulo identity, junto do login.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // agentRules: o AGENTS.md é do projeto; o next dev não deve reescrevê-lo.
  agentRules: false,
  poweredByHeader: false,
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};

export default nextConfig;
