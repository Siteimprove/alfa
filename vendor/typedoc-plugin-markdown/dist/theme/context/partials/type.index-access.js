export function indexAccessType(model) {
    const md = [];
    if (model.objectType) {
        md.push(this.partials.someType(model.objectType));
    }
    if (model.indexType) {
        md.push(`\\[${this.partials.someType(model.indexType)}\\]`);
    }
    return md.join('');
}
