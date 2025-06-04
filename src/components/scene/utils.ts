/**
 * Debounce function to limit resize event calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: any, ...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Device detection using Tailwind's breakpoints and pointer capabilities
 */
export function isDesktop(): boolean {
  const isLargeScreen = window.innerWidth >= 1024;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  return isLargeScreen && hasFinePointer && canHover;
}
