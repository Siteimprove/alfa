import { MarkdownThemeContext } from '../../../theme/index.js';
import { TypeParameterReflection } from 'typedoc';
export declare function getTypeParameters(this: MarkdownThemeContext, typeParameters?: TypeParameterReflection[], options?: {
    includeBackticks?: boolean;
}): string | undefined;
