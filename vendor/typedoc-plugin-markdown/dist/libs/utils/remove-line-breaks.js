export function removeLineBreaks(str) {
    return str?.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ');
}
