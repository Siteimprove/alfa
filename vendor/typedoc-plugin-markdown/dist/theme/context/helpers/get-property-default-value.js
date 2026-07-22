import { backTicks } from '../../../libs/markdown/index.js';
export function getPropertyDefaultValue(model) {
    const defaultValueTag = model.comment?.blockTags?.find((tag) => tag.tag === '@defaultValue');
    if (defaultValueTag) {
        return defaultValueTag?.content.map((content) => content.text).join('');
    }
    return model.defaultValue && model.defaultValue !== '...'
        ? backTicks(model.defaultValue)
        : null;
}
