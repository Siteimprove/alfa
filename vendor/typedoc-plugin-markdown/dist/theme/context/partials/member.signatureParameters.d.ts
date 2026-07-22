import { MarkdownThemeContext } from '../../../theme/index.js';
import { ParameterReflection } from 'typedoc';
export declare function signatureParameters(this: MarkdownThemeContext, model: ParameterReflection[], options?: {
    forceExpandParameters?: boolean;
}): string;
