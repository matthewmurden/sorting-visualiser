export function randomArray(n: number, min = 5, max = 100): number[] {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
