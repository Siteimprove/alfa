import * as path from 'path';
export function removeFirstScopedDirectory(urlString, sep) {
    const separator = sep || path.sep;
    const pathParts = urlString.replace(/\//g, path.sep).split(separator);
    const scopedDirectoryIndex = pathParts.findIndex((part) => part.startsWith('@'));
    if (scopedDirectoryIndex !== -1) {
        pathParts.splice(scopedDirectoryIndex, 1);
    }
    return pathParts.join(separator);
}
