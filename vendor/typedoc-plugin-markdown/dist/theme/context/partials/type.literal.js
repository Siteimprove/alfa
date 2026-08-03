export function literalType(model) {
    if (typeof model.value === 'bigint') {
        return `\`${model.value}n\``;
    }
    return `\`\`${JSON.stringify(model.value)}\`\``;
}
