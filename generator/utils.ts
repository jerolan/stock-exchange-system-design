// generator/utils.ts
let seq = 0;

export function nextId(prefix: string) {
  seq++;
  return `${prefix}-${seq}`;
}

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
