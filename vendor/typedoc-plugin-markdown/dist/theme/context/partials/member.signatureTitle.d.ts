import { MarkdownThemeContext } from '../../../theme/index.js';
import { SignatureReflection } from 'typedoc';
export declare function signatureTitle(this: MarkdownThemeContext, model: SignatureReflection, options?: {
    accessor?: string;
    includeType?: boolean;
}): string;
