import { MarkdownPageEvent } from '../../events/index.js';
import { MarkdownThemeContext } from '../../theme/index.js';
import { ArrayType, Comment, CommentDisplayPart, ConditionalType, ContainerReflection, DeclarationHierarchy, DeclarationReflection, DocumentReflection, IndexedAccessType, InferredType, IntersectionType, IntrinsicType, LiteralType, NamedTupleMember, OptionalType, ParameterReflection, ProjectReflection, QueryType, ReferenceReflection, ReferenceType, Reflection, ReflectionCategory, ReflectionFlags, ReflectionGroup, ReflectionKind, ReflectionType, SignatureReflection, SomeType, TupleType, TypeOperatorType, TypeParameterReflection, UnionType, UnknownType } from 'typedoc';
export declare const resourceTemplates: (context: MarkdownThemeContext) => {
    document: (page: MarkdownPageEvent<DocumentReflection>) => string;
    hierarchy: (page: MarkdownPageEvent<ProjectReflection>) => string;
    index: (page: MarkdownPageEvent<ProjectReflection>) => string;
    reflection: (page: MarkdownPageEvent<DeclarationReflection>) => string;
};
export declare const resourcePartials: (context: MarkdownThemeContext) => {
    comment: (model: Comment, options?: {
        headingLevel?: number | undefined;
        showSummary?: boolean | undefined;
        showTags?: boolean | undefined;
        showReturns?: boolean | undefined;
        isTableColumn?: boolean | undefined;
    }) => string;
    body: (model: ContainerReflection, options: {
        headingLevel: number;
    }) => string;
    categories: (models: ReflectionCategory[], options: {
        headingLevel: number;
    }) => string;
    groups: (model: ContainerReflection, options: {
        headingLevel: number;
        kind: ReflectionKind;
    }) => string;
    members: (model: DeclarationReflection[], options: {
        headingLevel: number;
        groupTitle?: string | undefined;
    }) => string;
    accessor: (model: DeclarationReflection, options: {
        headingLevel: number;
    }) => string;
    constructor: (model: DeclarationReflection, options: {
        headingLevel: number;
    }) => string;
    memberContainer: (model: DeclarationReflection, options: {
        headingLevel: number;
        nested?: boolean | undefined;
        groupTitle?: string | undefined;
    }) => string;
    declaration: (model: DeclarationReflection, options?: {
        headingLevel: number;
        nested?: boolean | undefined;
    }) => string;
    declarationTitle: (model: DeclarationReflection) => string;
    documents: (model: ProjectReflection | DeclarationReflection | ContainerReflection, options: {
        headingLevel: number;
    }) => string;
    enumMembersTable: (model: DeclarationReflection[]) => string;
    groupIndex: (group: ReflectionCategory | ReflectionGroup) => string;
    hierarchy: (model: DeclarationHierarchy, options: {
        headingLevel: number;
    }) => string;
    indexSignature: (model: SignatureReflection, options?: {
        headingLevel: number;
    } | undefined) => string;
    inheritance: (model: DeclarationReflection | SignatureReflection, options: {
        headingLevel: number;
    }) => string;
    memberTitle: (model: DeclarationReflection) => string;
    /**
     * Renders a top-level member that contains group and child members such as Classes, Interfaces and Enums.
     */
    memberWithGroups: (model: DeclarationReflection, options: {
        headingLevel: number;
    }) => string;
    parametersList: (model: ParameterReflection[], options: {
        headingLevel: number;
    }) => string;
    parametersTable: (model: ParameterReflection[]) => string;
    /**
 * Renders a collection of properties in a table.

There is no association list partial for properties as these are handled as a standard list of members.
 */
    propertiesTable: (model: DeclarationReflection[], options?: {
        isEventProps: boolean;
        kind: ReflectionKind;
    } | undefined) => string;
    referenceMember: (model: ReferenceReflection) => string;
    signature: (model: SignatureReflection, options: {
        headingLevel: number;
        nested?: boolean | undefined;
        accessor?: string | undefined;
        multipleSignatures?: boolean | undefined;
        hideTitle?: boolean | undefined;
    }) => string;
    signatureParameters: (model: ParameterReflection[], options?: {
        forceExpandParameters?: boolean | undefined;
    } | undefined) => string;
    signatureReturns: (model: SignatureReflection, options: {
        headingLevel: number;
    }) => string;
    signatureTitle: (model: SignatureReflection, options?: {
        accessor?: string | undefined;
        includeType?: boolean | undefined;
    } | undefined) => string;
    signatures: (model: DeclarationReflection, options: {
        headingLevel: number;
        nested?: boolean | undefined;
    }) => string;
    sources: (model: DeclarationReflection | SignatureReflection, options?: {
        hideLabel: boolean;
    } | undefined) => string;
    member: (model: DeclarationReflection, options: {
        headingLevel: number;
        nested?: boolean | undefined;
    }) => string;
    typeAndParent: (model: ReferenceType | ArrayType) => string;
    typeArguments: (model: SomeType[], options?: {
        forceCollapse?: boolean | undefined;
    } | undefined) => string;
    typeDeclaration: (model: DeclarationReflection, options: {
        headingLevel: number;
        allowSource?: boolean | undefined;
    }) => string;
    typeDeclarationContainer: (model: DeclarationReflection, typeDeclaration: DeclarationReflection, opts: {
        headingLevel: number;
        nested?: boolean | undefined;
    }) => string;
    typeDeclarationList: (model: DeclarationReflection[], options: {
        headingLevel: number;
    }) => string;
    typeDeclarationTable: (model: DeclarationReflection[], options: {
        kind?: ReflectionKind | undefined;
    }) => string;
    typeDeclarationUnionContainer: (model: DeclarationReflection, options: {
        headingLevel: number;
    }) => string;
    typeParametersList: (model: TypeParameterReflection[], options: {
        headingLevel: number;
    }) => string;
    typeParametersTable: (model: TypeParameterReflection[]) => string;
    breadcrumbs: () => string;
    footer: () => string;
    header: () => string;
    packagesIndex: (model: ProjectReflection) => string;
    pageTitle: () => string;
    arrayType: (model: ArrayType) => string;
    conditionalType: (model: ConditionalType) => string;
    indexAccessType: (model: IndexedAccessType) => string;
    inferredType: (model: InferredType) => string;
    intersectionType: (model: IntersectionType) => string;
    intrinsicType: (model: IntrinsicType) => string;
    literalType: (model: LiteralType) => string;
    namedTupleType: (model: NamedTupleMember) => string;
    optionalType: (model: OptionalType, options?: {
        forceCollapse?: boolean | undefined;
    } | undefined) => string;
    queryType: (model: QueryType) => string;
    referenceType: (model: ReferenceType) => string;
    declarationType: (model: DeclarationReflection, options?: {
        forceCollapse?: boolean | undefined;
    } | undefined) => string;
    functionType: (model: SignatureReflection[], options?: {
        forceParameterType?: boolean | undefined;
        typeSeparator?: string | undefined;
    } | undefined) => string;
    reflectionType: (model: ReflectionType, options?: {
        forceCollapse?: boolean | undefined;
    } | undefined) => string;
    someType: (model?: SomeType | undefined, options?: {
        forceCollapse?: boolean | undefined;
    } | undefined) => string;
    tupleType: (model: TupleType) => string;
    typeOperatorType: (model: TypeOperatorType) => string;
    unionType: (model: UnionType) => string;
    unknownType: (model: UnknownType) => string;
};
export declare const resourceHelpers: (context: MarkdownThemeContext) => {
    getAngleBracket: (bracket: "<" | ">") => string;
    getCommentParts: (model: CommentDisplayPart[]) => string;
    getDeclarationType: (model: DeclarationReflection) => SomeType | undefined;
    getDescriptionForComment: (comment: Comment) => string | null;
    getFlattenedDeclarations: (model: DeclarationReflection[], options?: {
        includeSignatures: boolean;
    } | undefined) => DeclarationReflection[];
    getHierarchyType: (model: SomeType, options?: {
        isTarget: boolean;
    } | undefined) => string;
    getKeyword: (model: ReflectionKind) => string | undefined;
    getModifier: (model: DeclarationReflection) => string | null;
    getParameterDefaultValue: (model: ParameterReflection) => string;
    getProjectName: (stringWithPlaceholders: string, page: MarkdownPageEvent<Reflection>, includeVersion?: boolean) => string;
    getPropertyDefaultValue: (model: DeclarationReflection) => string | null;
    getReflectionFlags: (reflectionFlags: ReflectionFlags) => string;
    getReturnType: (model?: SomeType | undefined) => string;
    getTypeParameters: (typeParameters?: TypeParameterReflection[] | undefined, options?: {
        includeBackticks?: boolean | undefined;
    } | undefined) => string | undefined;
    hasSignatures: (model: DeclarationReflection) => boolean;
    hasUsefulTypeDetails: (type: SomeType) => boolean;
    isGroupKind: (model: DeclarationReflection | SignatureReflection) => boolean;
    useTableFormat: (key: "properties" | "parameters" | "enums" | "typeDeclarations" | "propertyMembers", reflectionKind?: ReflectionKind | undefined) => boolean;
};
