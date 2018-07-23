export function byteCoverage(script, block) {
  const { start, end } = block.range;
  return end.offset - start.offset;
}
