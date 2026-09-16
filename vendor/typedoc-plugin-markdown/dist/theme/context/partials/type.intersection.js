export function intersectionType(model) {
    return model.types
        .map((intersectionType) => this.partials.someType(intersectionType))
        .join(' & ');
}
