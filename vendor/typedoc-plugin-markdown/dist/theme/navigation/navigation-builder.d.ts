import { MarkdownTheme } from '../../theme/index.js';
import { NavigationItem } from '../../types/index.js';
import { ProjectReflection, Router } from 'typedoc';
/**
 * Builds the navigation tree used by the Markdown theme.
 *
 * The builder assembles items from TypeDoc reflections, honouring
 * navigation options for categories, groups, folders, and packages.
 */
export declare class NavigationBuilder {
    router: Router;
    theme: MarkdownTheme;
    project: ProjectReflection;
    private options;
    private packagesMeta;
    private navigationOptions;
    private navigation;
    private isPackages;
    private includeHierarchySummary;
    private fileExtension;
    /**
     * Creates a navigation builder for a project.
     */
    constructor(router: Router, theme: MarkdownTheme, project: ProjectReflection);
    /**
     * Builds and returns the navigation structure for the current project.
     */
    getNavigation(): NavigationItem[];
    /**
     * Resolves navigation-related options from TypeDoc or legacy settings.
     */
    private getNavigationOptions;
    /**
     * Recursively removes empty `children` arrays from the navigation tree.
     */
    private removeEmptyChildren;
    /**
     * Builds navigation for a single package in a multi-package project.
     */
    private buildNavigationFromPackage;
    /**
     * Builds navigation for a standard (non-package) project.
     */
    private buildNavigationFromProject;
    /**
     * Builds navigation children for a category group.
     */
    private getCategoryGroupChildren;
    /**
     * Builds navigation children for a reflection group.
     */
    private getGroupChildren;
    /**
     * Builds navigation groups for a reflection, honoring include/exclude rules.
     */
    private getReflectionGroups;
    /**
     * Adds a reflection (and optional children) into the accumulator, optionally
     * grouping by folder-like name segments.
     */
    private processChildren;
    /**
     * Creates a navigation item for a reflection.
     */
    private buildNavigationItem;
    /**
     * Filters out the entry module item from a list of navigation items.
     */
    private filterEntryModule;
    /**
     * Determines the child navigation items for a group child reflection.
     */
    private getGroupChildChildren;
}
