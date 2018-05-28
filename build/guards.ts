export function isBench(path: string): boolean {
  return /\.bench\.tsx?$/.test(path);
}

export function isTest(path: string): boolean {
  return /\.test\.tsx?$/.test(path);
}

export function isDefinition(path: string): boolean {
  return /\.d\.ts$/.test(path);
}
