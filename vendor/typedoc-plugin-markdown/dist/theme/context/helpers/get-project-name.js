export function getProjectName(stringWithPlaceholders, page, includeVersion = true) {
    return stringWithPlaceholders
        .replace('{projectName}', page.project.name)
        .replace('{version}', includeVersion && page.project.packageVersion
        ? `v${page.project.packageVersion}`
        : '')
        .replace(/\s+/g, ' ')
        .trim();
}
