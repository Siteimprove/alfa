import { MarkdownThemeContext } from '../../../theme/index.js';
import { SignatureReflection } from 'typedoc';
export declare function signature(this: MarkdownThemeContext, model: SignatureReflection, options: {
    headingLevel: number;
    nested?: boolean;
    accessor?: string;
    multipleSignatures?: boolean;
    hideTitle?: boolean;
}): string;
