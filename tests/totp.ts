import { createHmac } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer {
  const chars = input.replace(/[\s=]/g, "").toUpperCase().split("");
  const bits = chars.map((c) => ALPHABET.indexOf(c).toString(2).padStart(5, "0")).join("");
  return Buffer.from((bits.match(/.{8}/g) ?? []).map((byte) => Number.parseInt(byte, 2)));
}

/** Código TOTP (RFC 6238, SHA-1, 6 dígitos, 30 s) de um segredo base32, como o app autenticador gera. */
export function totpCode(secret: string, at = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const mac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = (mac.at(-1) ?? 0) & 15;
  return String((mac.readUInt32BE(offset) & 0x7f_ff_ff_ff) % 1_000_000).padStart(6, "0");
}
