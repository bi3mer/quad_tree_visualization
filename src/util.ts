export function lerp(a: number, b: number, percent: number) {
  return (1 - percent) * a + percent * b;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

// randomly return -1 or 1
export function randomSign(): number {
  return Math.sign(Math.random() - 0.5);
}

// Clamp num between min and max. This function does not check to see if min 
// is less than max.
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
