export function unorderedList(items) {
    return items.map((item) => `- ${item}`).join('\n');
}
