import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection, DocumentReflection, ReflectionCategory, ReflectionGroup } from 'typedoc';
export declare function groupIndex(this: MarkdownThemeContext, group: ReflectionGroup | ReflectionCategory): string;
export declare function getGroupIndexList(context: MarkdownThemeContext, children: (DeclarationReflection | DocumentReflection)[]): string;
export declare function getGroupIndexTable(context: MarkdownThemeContext, children: (DeclarationReflection | DocumentReflection)[]): string;
