const TypeScript = require("typescript");
const { parseSource } = require("../typescript");

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
 * @param {String} source
 */
const createSource = source => parseSource(source);

/**
 * @param {Script} script
 */
function totalOperations(script) {
  let total = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += visit(createSource(script.sources[i].content));
    }
  } else {
    // javascript
    total += visit(createSource(script.sources[0].content));
  }

  return total;
}

/**
 * @param {TypeScript.Node} node
 */
function visit(node, depth = -1) {
  let total = 0;

  switch (node.kind) {
    case TypeScript.SyntaxKind.BinaryExpression:
      const binaryExpression = /** @type {TypeScript.BinaryExpression} */ (node);
      switch (binaryExpression.operatorToken.kind) {
        case TypeScript.SyntaxKind.AmpersandAmpersandToken:
        case TypeScript.SyntaxKind.BarBarToken:
        case TypeScript.SyntaxKind.GreaterThanToken:
        case TypeScript.SyntaxKind.GreaterThanEqualsToken:
        case TypeScript.SyntaxKind.LessThanToken:
        case TypeScript.SyntaxKind.LessThanEqualsToken:
        case TypeScript.SyntaxKind.EqualsEqualsToken:
        case TypeScript.SyntaxKind.EqualsEqualsEqualsToken:
        case TypeScript.SyntaxKind.ExclamationEqualsToken:
        case TypeScript.SyntaxKind.ExclamationEqualsEqualsToken:
          depth++;
          total += Math.pow(1.1, depth);
      }
  }

  TypeScript.forEachChild(node, node => {
    total += visit(node, depth > -1 ? depth++ : -1);
  });

  return total;
}

const Logical = {
  /**
   * @param {Script} script
   */
  total(script) {
    const total = totalOperations(script);
    let uncovered = 0;

    for (let block of script.coverage) {
      if (block.count < 1) {
        const file = script.sources.find(source => {
          return source.path === block.range.start.path;
        });

        if (file === undefined) {
          continue;
        }

        uncovered += visit(
          createSource(
            file.content.substring(
              block.range.start.offset,
              block.range.end.offset
            )
          )
        );
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
   * @return {number}
   */
  block(script, block, total) {
    const file = script.sources.find(source => {
      return source.path === block.range.start.path;
    });

    if (file === undefined) {
      return 0;
    }

    let uncovered = visit(
      createSource(
        file.content.substring(block.range.start.offset, block.range.end.offset)
      )
    );

    if (total === 0) {
      return 100;
    }

    return (uncovered / total) * 100;
  }
};

exports.Logical = Logical;
