import { BaseRouter, PageDefinition, ProjectReflection, Reflection, ReflectionKind, RouterTarget } from 'typedoc';
export declare abstract class MarkdownRouter extends BaseRouter {
    extension: string;
    outputFileStrategy: "members" | "modules";
    entryModule: string;
    ignoreScopes: boolean;
    modulesFileName: string;
    entryFileName: string;
    isPackages: boolean;
    membersWithOwnFile: ("Enum" | "Variable" | "Function" | "Class" | "Interface" | "TypeAlias")[];
    mergeReadme: boolean;
    anchorPrefix: string;
    directories: Map<ReflectionKind, string>;
    kindsToString: Map<ReflectionKind, string>;
    tableAnchorRules: {
        targetKind: ReflectionKind;
        parentKind: ReflectionKind;
        option: string;
    }[];
    buildPages(project: ProjectReflection): PageDefinition<RouterTarget>[];
    getAnchor(target: RouterTarget): string | undefined;
    /**
     * This is essentially a copy of the BaseRouter implementation, but adjusted to
     * generate anchors in a way that is compatible with markdown links.
     */
    protected buildAnchors(target: RouterTarget, pageTarget: RouterTarget): void;
    private isTableAnchor;
    private parseChildPages;
    getIdealBaseNameFlattened(reflection: Reflection): string;
    getReflectionAlias(reflection: Reflection): string;
    getModulesFileName(reflection: Reflection): string;
}
