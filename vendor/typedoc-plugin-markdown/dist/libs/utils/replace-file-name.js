export function replaceFilename(originalPath, newFileName) {
    return originalPath
        .replace(/\\/g, '/')
        .replace(/\/[^/]+(\.[^/.]+)$/, `/${newFileName}$1`);
}
