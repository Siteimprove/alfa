import { MarkdownThemeContext } from '../../../theme/index.js';
import { Comment } from 'typedoc';
export declare function comment(this: MarkdownThemeContext, model: Comment, options?: {
    headingLevel?: number;
    showSummary?: boolean;
    showTags?: boolean;
    showReturns?: boolean;
    isTableColumn?: boolean;
}): string;
