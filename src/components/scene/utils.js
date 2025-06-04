/**
 * Debounce function to limit resize event calls
 */
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Device detection using Tailwind's breakpoints and pointer capabilities
 */
export function isDesktop() {
  const isLargeScreen = window.innerWidth >= 1024;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  return isLargeScreen && hasFinePointer && canHover;
}