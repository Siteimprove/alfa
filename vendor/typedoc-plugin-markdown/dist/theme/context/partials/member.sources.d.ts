import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection, SignatureReflection } from 'typedoc';
export declare function sources(this: MarkdownThemeContext, model: DeclarationReflection | SignatureReflection, options?: {
    hideLabel: boolean;
}): string;
