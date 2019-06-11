const TypeScript = require("typescript");
const { isFile, readFile, removeFile, writeFile } = require("./file-system");
const { getLineAtOffset, parseLines } = require("./text");
const { Project } = require("../helpers/project");

const name = "TODO.md";

/**
 * @typedef {Object} Line
 * @property {string} value
 * @property {number} index
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} AnnotadedComment
 * @property {string} file
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
 * @param {Project} project
 * @return {Array<AnnotadedComment>}
 */
function computeComments(file, project) {
  return project
    .getTodos(file, checks)
    .map(comment => ({ file: file, comment: comment }));
}

/**
 * @param {Array<AnnotadedComment>} todos
 */
function createTODOSFile(todos) {
  if (todos.length === 0) {
    if (isFile(name)) {
      removeFile(name);
    }
    return;
  }

  let commentFileData = ``;

  /**
   * @type {Map<String, Array<String>>}
   */
  const grouping = new Map();

  for (const todo of todos) {
    const lines = parseLines(readFile(todo.file));
    if (lines === undefined) {
      continue;
    }

    const line = getLineAtOffset(lines, todo.comment.position).index;
    const message = todo.comment.message.substring(
      todo.comment.descriptor.text.length + 1
    );
    const annotadedType = todo.comment.descriptor.text
      .substring(1)
      .toUpperCase();
    const list = grouping.get(annotadedType);
    const url = `${todo.file.replace(/\\/g, "/")}#L${line}`;

    const string = `* [${todo.file}:${line}](${url}): ${message}\r\n`;

    if (list !== undefined) {
      list.push(string);
      grouping.set(annotadedType, list);
    } else {
      grouping.set(annotadedType, [string]);
    }
  }

  if (grouping.keys() === undefined) {
    return;
  }
  for (const key of grouping.keys()) {
    commentFileData += `# ${key}:\r\n`;
    const val = grouping.get(key);
    if (val === undefined) {
      continue;
    }
    for (const ln of val) {
      commentFileData += ln;
    }
    commentFileData += "\r\n";
  }

  writeFile(`./${name}`, commentFileData);
}

exports.computeComments = computeComments;
exports.createTODOSFile = createTODOSFile;
