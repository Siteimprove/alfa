const path = require("path");
const prettier = require("prettier");
const TypeScript = require("typescript");

const { readFile, writeFile } = require("./file-system");
const { getLineAtOffset, parseLines } = require("./text");
const { flatMap, groupBy, map } = require("./iterable");
const { Project } = require("../helpers/project");

/**
 * @typedef {import("./text").Line} Line
 */

/**
 * @typedef {Object} Todo
 * @property {string} file
 * @property {string} pkg
 * @property {TypeScript.TodoComment} comment
 */

/**
 * @type {Array<TypeScript.TodoCommentDescriptor>}
 */
const checks = [
  { text: "@todo", priority: 1 },
  { text: "@hack", priority: 1 },
  { text: "@bug", priority: 1 },
  { text: "@fixme", priority: 1 }
];

/**
 * @param {string} file
 * @param {string} pkg
 * @param {Project} project
 * @return {Iterable<Todo>}
 */
function getTodos(file, pkg, project) {
  return [...project.getTodos(file, checks)].map(comment => ({
    file,
    pkg,
    comment
  }));
}

exports.getTodos = getTodos;

/**
 * @param {string} file
 * @param {Iterable<Todo>} todos
 */
function writeTodos(file, todos) {
  const todosByPackage = groupBy(todos, todo => todo.pkg);

  const contentByPackage = map(todosByPackage, ([pkg, todos]) => {
    const todosByFile = groupBy(todos, todo => todo.file);

    const contentByFile = flatMap(todosByFile, ([file, todos]) => {
      const lines = parseLines(readFile(file));

      file = file.split(path.sep).join("/");

      return map(todos, todo => {
        const line = getLineAtOffset(lines, todo.comment.position).index + 1;
        const message = todo.comment.message.substring(
          todo.comment.descriptor.text.length + 1
        );
        const type = todo.comment.descriptor.text.toLowerCase();
        const content = `* [${file.replace(
          `packages/${todo.pkg}/`,
          ""
        )}:${line}](${file}#L${line}): ${message}\n`;
        return { type, content };
      });
    });

    const contentByTypeGrouped = groupBy(contentByFile, todo => todo.type);

    return { pkg, contentByTypeGrouped };
  });

  let content = "";

  for (const item of contentByPackage) {
    content += `## [@siteimprove/${item.pkg}](packages/${item.pkg})\n`;

    for (const [type, todos] of item.contentByTypeGrouped) {
      content += `### ${type}\n`;

      for (const todo of todos) {
        content += todo.content;
      }

      content += "\n";
    }
  }

  content = prettier.format(content, {
    parser: "markdown"
  });

  writeFile(file, content);
}

exports.writeTodos = writeTodos;
