import { effect, signal, Signal, untracked } from '@angular/core';

export function toDebouncedLoading(
  isLoading: Signal<boolean>,
  delayMs: number = 800
): Signal<boolean> {
  const delayed = signal(false);

  effect((onCleanup) => {
    const loading = isLoading();

    if (loading) {
      const timeoutId = setTimeout(() => {
        untracked(() => delayed.set(true));
      }, delayMs);

      onCleanup(() => clearTimeout(timeoutId));
    } else {
      untracked(() => delayed.set(false));
    }
  });

  return delayed.asReadonly();
}
