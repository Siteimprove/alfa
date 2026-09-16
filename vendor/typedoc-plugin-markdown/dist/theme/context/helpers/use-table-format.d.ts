import { MarkdownThemeContext } from '../../../theme/index.js';
import { ReflectionKind } from 'typedoc';
export declare function useTableFormat(this: MarkdownThemeContext, key: 'properties' | 'parameters' | 'enums' | 'typeDeclarations' | 'propertyMembers', reflectionKind?: ReflectionKind): boolean;
