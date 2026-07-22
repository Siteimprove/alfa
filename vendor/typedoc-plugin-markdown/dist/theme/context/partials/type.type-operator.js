export function typeOperatorType(model) {
    return `${model.operator} ${this.partials.someType(model.target)}`;
}
