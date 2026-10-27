import { describe, expect, it } from "vitest";
import { isSupportedPostgres } from "./postgres.ts";

describe("isSupportedPostgres", () => {
  it("aceita 18 em diante e recusa 17", () => {
    expect(isSupportedPostgres(180_006)).toBe(true);
    expect(isSupportedPostgres(190_000)).toBe(true);
    expect(isSupportedPostgres(170_009)).toBe(false);
  });
});
