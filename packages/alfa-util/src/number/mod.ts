export function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}
