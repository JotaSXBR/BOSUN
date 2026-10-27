"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * true depois que o React assumiu a página (false no HTML do servidor e na hidratação). Antes disso um clique
 * faria o envio nativo do <form>; os botões de envio ficam desligados até aqui.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
