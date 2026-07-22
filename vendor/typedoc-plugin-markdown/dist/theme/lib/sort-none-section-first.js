import { isNoneSection } from './is-none-section.js';
export function sortNoneSectionFirst(a, b) {
    if (isNoneSection(a)) {
        return -1;
    }
    if (isNoneSection(b)) {
        return 1;
    }
    return 0;
}
