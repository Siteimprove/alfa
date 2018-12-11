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
function visit(node) {
  let total = 0;

  switch (node.kind) {
    case TypeScript.SyntaxKind.CaseClause:
      const newNode = /** @type {TypeScript.CaseClause} */ (node);
      total += newNode.statements.length;
      break;
    case TypeScript.SyntaxKind.CatchClause:
    case TypeScript.SyntaxKind.ConditionalExpression:
    case TypeScript.SyntaxKind.DoStatement:
    case TypeScript.SyntaxKind.ForStatement:
    case TypeScript.SyntaxKind.ForInStatement:
    case TypeScript.SyntaxKind.ForOfStatement:
    case TypeScript.SyntaxKind.IfStatement:
    case TypeScript.SyntaxKind.WhileStatement:
      total++;
      break;
  }

  TypeScript.forEachChild(node, node => {
    total += visit(node);
  });

  return total;
}

const Cyclomatic = {
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

exports.Cyclomatic = Cyclomatic;
