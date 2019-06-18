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
 * @param {Script} script
 */
function totalOperations(script) {
  let total = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += visit(parseSource(script.sources[i].content));
    }
  } else {
    // javascript
    total += visit(parseSource(script.sources[0].content));
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
        case TypeScript.SyntaxKind.SlashToken:
        case TypeScript.SyntaxKind.PlusToken:
        case TypeScript.SyntaxKind.MinusToken:
        case TypeScript.SyntaxKind.AsteriskToken:
        case TypeScript.SyntaxKind.PercentToken:
        case TypeScript.SyntaxKind.PlusEqualsToken:
        case TypeScript.SyntaxKind.MinusEqualsToken:
        case TypeScript.SyntaxKind.AsteriskEqualsToken:
        case TypeScript.SyntaxKind.SlashEqualsToken:
          depth++;
          total += Math.pow(1.1, depth);
      }
      break;
    case TypeScript.SyntaxKind.PrefixUnaryExpression:
      const prefixUnaryExpression = /** @type {TypeScript.PrefixUnaryExpression} */ (node);

      switch (prefixUnaryExpression.operator) {
        case TypeScript.SyntaxKind.PlusPlusToken:
        case TypeScript.SyntaxKind.MinusMinusToken:
          total++;
      }
      break;
    case TypeScript.SyntaxKind.PostfixUnaryExpression:
      const postfixUnaryOperator = /** @type {TypeScript.PostfixUnaryExpression} */ (node);

      switch (postfixUnaryOperator.operator) {
        case TypeScript.SyntaxKind.PlusPlusToken:
        case TypeScript.SyntaxKind.MinusMinusToken:
          total++;
      }
  }

  TypeScript.forEachChild(node, node => {
    total += visit(node, depth > -1 ? depth++ : -1);
  });

  return total;
}

const Arithmetic = {
  /**
   * @param {Script} script
   * @param {BlockCoverage | FunctionCoverage} block
   * @return {number}
   */
  total(script) {
    const total = totalOperations(script);
    let uncovered = 0;

    for (const block of script.coverage) {
      if (block.count < 1) {
        const file = script.sources.find(source => {
          return source.path === block.range.start.path;
        });

        if (file === undefined) {
          continue;
        }

        uncovered += visit(
          parseSource(
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

    const uncovered = visit(
      parseSource(
        file.content.substring(block.range.start.offset, block.range.end.offset)
      )
    );

    if (total === 0) {
      return 100;
    }

    return (uncovered / total) * 100;
  }
};

exports.Arithmetic = Arithmetic;
