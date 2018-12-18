const TypeScript = require("typescript");
const { isFile, readFile, removeFile, writeFile } = require("./file-system");
const { getBranch } = require("./git");
const { getLineNumber } = require("./text");

const { formattedDateTime } = require("./time");
const { Project } = require("../helpers/project");

const name = "TODOS.md";

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

// const lines = /**@type {Set<String>} */ (new Set());

/**
 * @param {string} file
 * @param {Project} project
 * @return {Array<AnnotadedComment>}
 */
function computeComments(file, project) {
  /**
   * @type {Array<AnnotadedComment>}
   */
  const comments = [];
  for (const comment of project.getTodos(file, checks)) {
    comments.push({ file: file, comment: comment });
  }

  return comments;
}

/**
 * @param {Array<AnnotadedComment>} todos
 */
function createTODOSFile(todos) {
  if (todos.length === 0) {
    if (isFile(name)) removeFile(name);
    return;
  }

  let commentFileData = `Last updated: ${formattedDateTime()}\r\n`;
  /**
   * @type {Map<String, Array<String>>}
   */
  const grouping = new Map();
  for (const todo of todos) {
    const line = getLineNumber(readFile(todo.file), todo.comment.position);
    const message = todo.comment.message.substring(
      todo.comment.descriptor.text.length + 1
    );
    const annotadedType = todo.comment.descriptor.text
      .substring(1)
      .toUpperCase();
    const list = grouping.get(annotadedType);
    const url = `https://github.com/siteimprove/alfa/blob/${getBranch()}/${todo.file.replace(
      /\\/g,
      "/"
    )}#L${line}`;

    const string = `* [${todo.file}:${line}](${url}): ${message}\r\n`;

    if (list !== undefined) {
      list.push(string);
      grouping.set(annotadedType, list);
    } else {
      grouping.set(annotadedType, [string]);
    }
  }

  if (grouping.keys() === undefined) return;
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
