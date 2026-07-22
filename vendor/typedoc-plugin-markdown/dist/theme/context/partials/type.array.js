export function arrayType(model) {
    const theType = this.partials.someType(model.elementType);
    return model.elementType.type === 'union' ? `(${theType})[]` : `${theType}[]`;
}
