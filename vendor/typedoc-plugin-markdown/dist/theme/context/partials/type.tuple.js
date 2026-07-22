export function tupleType(model) {
    return `\\[${model.elements
        .map((element) => this.partials.someType(element, { forceCollapse: true }))
        .join(', ')}\\]`;
}
