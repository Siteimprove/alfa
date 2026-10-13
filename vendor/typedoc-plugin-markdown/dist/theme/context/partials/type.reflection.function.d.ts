import { MarkdownThemeContext } from '../../../theme/index.js';
import { SignatureReflection } from 'typedoc';
export declare function functionType(this: MarkdownThemeContext, model: SignatureReflection[], options?: {
    forceParameterType?: boolean;
    typeSeparator?: string;
}): string;
