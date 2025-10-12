// Безопасная обёртка над localStorage (SSR/приватный режим/и т.п.)
export const safeStorage = {
    getItem(key: string) {
      try { return window?.localStorage?.getItem(key) ?? null; } catch { return null; }
    },
    setItem(key: string, value: string) {
      try { window?.localStorage?.setItem(key, value); } catch {}
    },
    removeItem(key: string) {
      try { window?.localStorage?.removeItem(key); } catch {}
    },
  };
  