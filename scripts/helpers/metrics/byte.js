/**
 * @typedef {import("../coverage").Script} Script
 */

/**
 * @typedef {import("../coverage").FunctionCoverage} FunctionCoverage
 */

/**
 * @typedef {import("../coverage").BlockCoverage} BlockCoverage
 */

/**
 * @param {Script} script
 * @return {number}
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

const Byte = {
  /**
   * @param {Script} script
   */
  total(script) {
    let uncovered = 0;
    const total = totalLength(script);

    for (const block of script.coverage) {
      if (block.count === 0) {
        uncovered += block.range.end.offset - block.range.start.offset;
      }
    }

    if (total === 0) {
      return 100;
    }

    return (1 - uncovered / total) * 100;
  },

  /**
   * @param {Script} script
   * @param {BlockCoverage | FunctionCoverage} block
   * @param {number} total
   */
  block(script, block, total) {
    const { start, end } = block.range;

    if (total === 0) {
      return 100;
    }

    return ((end.offset - start.offset) / total) * 100;
  }
};

exports.Byte = Byte;
