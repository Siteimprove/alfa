import { ReflectionType } from 'typedoc';
export function typeArguments(model, options) {
    return `${this.helpers.getAngleBracket('<')}${model
        .map((typeArgument) => {
        if (typeArgument instanceof ReflectionType) {
            return this.partials.reflectionType(typeArgument, {
                forceCollapse: options?.forceCollapse,
            });
        }
        return this.partials.someType(typeArgument);
    })
        .join(', ')}${this.helpers.getAngleBracket('>')}`;
}
