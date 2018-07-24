import { BlockCoverage, FunctionCoverage, Script } from "../coverage";

/**
 * @param {Script} script
 */
export function byteLengthTotalCoverage(script) {
  let uncovered = 0;
  for (const block of script.coverage) {
    if (block.count === 0) {
      uncovered += block.range.end.offset - block.range.start.offset;
    }
  }

  return (uncovered / totalLength(script)) * 100;
}

/**
 * @param {Script} script
 * @param {BlockCoverage | FunctionCoverage} block
 */
export function byteLengthBlockCoverage(script, block) {
  const { start, end } = block.range;
  return ((end.offset - start.offset) / totalLength(script)) * 100;
}

/**
 * @param {Script} script
 */
function totalLength(script) {
  let total = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += script.sources[i].content.length;
    }
  } else {
    // javascript
    total = script.sources[0].content.length;
  }
  return total;
}
