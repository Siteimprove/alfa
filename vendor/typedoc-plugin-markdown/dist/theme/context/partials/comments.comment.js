import { backTicks, bold, heading } from '../../../libs/markdown/index.js';
import { camelToTitleCase, escapeChars, sanitizeComments, } from '../../../libs/utils/index.js';
import { translateTagName, } from 'typedoc';
const exampleTagNames = ['@example', '@examples'];
export function comment(model, options = {}) {
    const opts = {
        headingLevel: undefined,
        showSummary: true,
        showTags: true,
        showReturns: false,
        isTableColumn: false,
        ...options,
    };
    const md = [];
    //Add flags and summary
    if (opts.showSummary) {
        const flagsNotRendered = [
            '@showCategories',
            '@showGroups',
            '@hideCategories',
            '@hideGroups',
            '@disableGroups',
        ];
        const flags = [];
        for (const tag of model.modifierTags) {
            if (!flagsNotRendered.includes(tag)) {
                flags.push(bold(backTicks(camelToTitleCase(tag.substring(1)))));
            }
        }
        md.push(flags.join(' '));
        // Add summary
        if (model.summary?.length > 0) {
            md.push(this.helpers.getCommentParts(model.summary));
        }
    }
    const blockTagsPreserveOrder = this.options.getValue('blockTagsPreserveOrder');
    const shouldSanitizeComments = this.options.getValue('sanitizeComments');
    const showTags = opts.showTags || (opts.showSummary && blockTagsPreserveOrder.length > 0);
    // Add Tags
    if (showTags && model.blockTags?.length > 0) {
        const blockTags = model.blockTags.reduce((previous, current) => {
            const tag = current.clone();
            tag.content = getNamedTagContent(tag, shouldSanitizeComments);
            if (tag.tag === '@example') {
                const previousExampleTag = previous.find((previousTag) => exampleTagNames.includes(previousTag.tag));
                if (previousExampleTag) {
                    previousExampleTag.tag = '@examples';
                    previousExampleTag.content.push({ kind: 'text', text: '\n\n' }, ...tag.content);
                    return previous;
                }
            }
            return [...previous, tag];
        }, []);
        const filteredBlockTags = [
            ...this.options.getValue('notRenderedTags'),
            ...(opts.showReturns ? [] : ['@returns']),
        ];
        const tags = blockTags
            .filter((tag) => !filteredBlockTags.includes(tag.tag))
            .filter((tag) => {
            if (!opts.isTableColumn &&
                !(opts.showSummary && opts.showTags) &&
                blockTagsPreserveOrder.length) {
                return opts.showSummary
                    ? blockTagsPreserveOrder.includes(tag.tag)
                    : !blockTagsPreserveOrder.includes(tag.tag);
            }
            return true;
        })
            .filter((tag) => !opts.isTableColumn ||
            (opts.isTableColumn && tag.tag !== '@defaultValue'))
            .map((tag) => {
            const tagText = translateTagName(tag.tag);
            const tagMd = [
                opts.headingLevel
                    ? heading(opts.headingLevel, tagText) + '\n'
                    : bold(tagText) + '\n',
            ];
            tagMd.push(this.helpers.getCommentParts(tag.content));
            return tagMd.join('\n');
        });
        md.push(tags.join('\n\n'));
    }
    const output = md.join('\n\n');
    const parsedOutput = shouldSanitizeComments
        ? sanitizeComments(output)
        : output;
    return parsedOutput;
}
function getNamedTagContent(tag, shouldSanitizeComments) {
    if (!tag.name) {
        return tag.content;
    }
    const tagName = stripCaptionTag(tag.name);
    const escapedTagName = shouldSanitizeComments
        ? escapeNameChars(tagName)
        : escapeChars(tagName);
    return [
        {
            kind: 'text',
            text: `${bold(escapedTagName)}\n\n`,
        },
        ...tag.content,
    ];
}
function escapeNameChars(str) {
    return str
        .replace(/_/g, '\\_')
        .replace(/`/g, '\\`')
        .replace(/\|/g, '\\|')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\*/g, '\\*');
}
function stripCaptionTag(str) {
    const caption = str.match(/^<caption>(.*?)<\/caption>$/);
    return caption?.[1] ?? str;
}
