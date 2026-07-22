import { link } from '../../../libs/markdown/index.js';
import { escapeChars } from '../../../libs/utils/index.js';
import { i18n } from 'typedoc';
export function sources(model, options) {
    const md = [];
    if (!options?.hideLabel) {
        md.push(`${i18n.theme_defined_in()}:`);
    }
    model.sources?.forEach((source, index) => {
        if (index === 0) {
            if (source.url) {
                md.push(link(`${escapeChars(source.fileName)}:${source.line}`, source.url));
            }
            else {
                md.push(`${escapeChars(source.fileName)}:${source.line}`);
            }
        }
    });
    return md.join(' ');
}
