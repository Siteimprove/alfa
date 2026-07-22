export function optionalType(model, options) {
    const result = this.partials.someType(model.elementType, {
        forceCollapse: options?.forceCollapse,
    });
    return model.elementType.type === 'union' ? `(${result})?` : `${result}?`;
}
