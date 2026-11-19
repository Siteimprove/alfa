import { isQuoted } from '../../libs/utils/index.js';
import { getHierarchyRoots, isNoneSection, sortNoneSectionFirst, } from '../../theme/lib/index.js';
import { DeclarationReflection, EntryPointStrategy, i18n, ReflectionKind, } from 'typedoc';
/**
 * Builds the navigation tree used by the Markdown theme.
 *
 * The builder assembles items from TypeDoc reflections, honouring
 * navigation options for categories, groups, folders, and packages.
 */
export class NavigationBuilder {
    router;
    theme;
    project;
    options;
    packagesMeta;
    navigationOptions;
    navigation = [];
    isPackages;
    includeHierarchySummary;
    fileExtension;
    /**
     * Creates a navigation builder for a project.
     */
    constructor(router, theme, project) {
        this.router = router;
        this.theme = theme;
        this.project = project;
        this.options = theme.application.options;
        this.navigationOptions = this.getNavigationOptions();
        this.packagesMeta =
            theme.application.renderer
                .packagesMeta || {};
        this.navigation = [];
        this.isPackages =
            this.options.getValue('entryPointStrategy') ===
                EntryPointStrategy.Packages;
        this.includeHierarchySummary =
            this.options.isSet('includeHierarchySummary') &&
                this.options.getValue('includeHierarchySummary');
        this.fileExtension = this.options.getValue('fileExtension');
    }
    /**
     * Builds and returns the navigation structure for the current project.
     */
    getNavigation() {
        if (this.isPackages) {
            if (Object.keys(this.packagesMeta)?.length === 1) {
                this.buildNavigationFromProject(this.project);
            }
            else {
                this.project.children?.forEach((projectChild) => {
                    this.buildNavigationFromPackage(projectChild);
                });
            }
        }
        else {
            this.buildNavigationFromProject(this.project);
        }
        this.removeEmptyChildren(this.navigation);
        return this.navigation;
    }
    /**
     * Resolves navigation-related options from TypeDoc or legacy settings.
     */
    getNavigationOptions() {
        if (this.options.isSet('navigation')) {
            const navigationOptions = this.options.getValue('navigation');
            return {
                excludeCategories: !navigationOptions.includeCategories,
                excludeGroups: !navigationOptions.includeGroups,
                excludeFolders: !navigationOptions.includeFolders,
            };
        }
        return this.options.getValue('navigationModel');
    }
    /**
     * Recursively removes empty `children` arrays from the navigation tree.
     */
    removeEmptyChildren(navigation) {
        navigation.forEach((navItem) => {
            if (navItem.children) {
                this.removeEmptyChildren(navItem.children);
                navItem.children = navItem.children.filter((child) => Object.keys(child).length > 0);
                if (navItem.children.length === 0) {
                    delete navItem.children;
                }
            }
        });
    }
    /**
     * Builds navigation for a single package in a multi-package project.
     */
    buildNavigationFromPackage(projectChild) {
        const packageOptions = this.packagesMeta[projectChild.name]?.options;
        const entryModule = packageOptions?.isSet('entryModule')
            ? packageOptions.getValue('entryModule')
            : this.options.getValue('entryModule');
        const projectChildUrl = this.router.getFullUrl(projectChild);
        const childGroups = this.getReflectionGroups(projectChild);
        const children = this.filterEntryModule(childGroups, entryModule);
        this.navigation.push({
            title: projectChild.name,
            kind: projectChild.kind,
            children,
            ...(projectChildUrl && { path: projectChildUrl }),
        });
    }
    /**
     * Builds navigation for a standard (non-package) project.
     */
    buildNavigationFromProject(project) {
        const entryModule = this.options.getValue('entryModule');
        const includeCategories = !this.navigationOptions.excludeCategories;
        const includeGroups = !this.navigationOptions.excludeGroups;
        if (this.includeHierarchySummary &&
            getHierarchyRoots(project)?.length) {
            this.navigation.push({
                title: i18n.theme_hierarchy(),
                path: `hierarchy${this.fileExtension}`,
            });
        }
        if (includeCategories && project.categories?.length) {
            this.navigation.push(...project.categories.flatMap((category) => {
                const children = this.getCategoryGroupChildren(category);
                if (!children?.length)
                    return [];
                return {
                    title: category.title,
                    ...(this.router.hasUrl(category) && {
                        path: this.router.getFullUrl(category),
                    }),
                    children,
                };
            }));
            return;
        }
        if (!project.groups?.length)
            return;
        const isOnlyModules = project.children?.every((child) => child.kind === ReflectionKind.Module);
        if (isOnlyModules) {
            project.groups.forEach((projectGroup) => {
                const children = this.getGroupChildren(projectGroup);
                if (!children?.length)
                    return;
                const filteredChildren = this.filterEntryModule(children, entryModule);
                if (projectGroup.title === i18n.kind_plural_module()) {
                    this.navigation.push(...filteredChildren);
                    return;
                }
                if (!includeGroups) {
                    this.navigation.push(...filteredChildren);
                    return;
                }
                if (projectGroup.owningReflection.kind === ReflectionKind.Document) {
                    this.navigation.push({
                        title: projectGroup.title,
                        children: projectGroup.children.map((child) => this.buildNavigationItem(child.name, child, null)),
                    });
                    return;
                }
                this.navigation.push({
                    title: projectGroup.title,
                    children: filteredChildren,
                });
            });
            return;
        }
        project.groups.forEach((projectGroup) => {
            const children = this.getGroupChildren(projectGroup);
            const indexModule = projectGroup.children.find((child) => child.name === entryModule);
            if (children?.length) {
                this.navigation.push({
                    title: projectGroup.title,
                    children: this.filterEntryModule(children, entryModule),
                });
            }
            if (indexModule) {
                const children = indexModule instanceof DeclarationReflection
                    ? this.getReflectionGroups(indexModule)
                    : [];
                if (children) {
                    this.navigation.push(...children);
                }
            }
        });
    }
    /**
     * Builds navigation children for a category group.
     */
    getCategoryGroupChildren(group) {
        return group.children
            ?.filter((child) => this.router.hasOwnDocument(child))
            .map((child) => {
            const children = child instanceof DeclarationReflection
                ? this.getReflectionGroups(child)
                : [];
            return this.buildNavigationItem(child.name, child, children);
        });
    }
    /**
     * Builds navigation children for a reflection group.
     */
    getGroupChildren(group) {
        const includeCategories = !this.navigationOptions.excludeCategories;
        if (includeCategories && group?.categories?.length) {
            return group.categories?.map((category) => ({
                title: category.title,
                children: this.getCategoryGroupChildren(category),
            }));
        }
        return group.children
            ?.filter((child) => this.router.hasOwnDocument(child))
            .reduce((acc, child) => {
            const children = this.getGroupChildChildren(child, includeCategories);
            return this.processChildren(acc, child, children);
        }, []);
    }
    /**
     * Builds navigation groups for a reflection, honoring include/exclude rules.
     */
    getReflectionGroups(reflection, outputFileStrategy) {
        if (reflection instanceof DeclarationReflection) {
            const includeGroups = !this.navigationOptions.excludeGroups;
            if (!includeGroups) {
                return reflection.childrenIncludingDocuments
                    ?.filter((child) => this.router.hasOwnDocument(child))
                    .reduce((acc, child) => {
                    const children = this.getReflectionGroups(child, outputFileStrategy);
                    return this.processChildren(acc, child, children);
                }, []);
            }
            const groupsWithOwnFilesOnly = reflection.groups?.filter((group) => group.children.every((child) => this.router.hasOwnDocument(child)));
            if (groupsWithOwnFilesOnly?.length === 1 &&
                groupsWithOwnFilesOnly[0].children.every((child) => child.kind === ReflectionKind.Module)) {
                return this.getGroupChildren(groupsWithOwnFilesOnly[0]);
            }
            return reflection.groups?.sort(sortNoneSectionFirst)?.flatMap((group) => {
                const groupChildren = this.getGroupChildren(group);
                if (!groupChildren?.length)
                    return [];
                if (group.owningReflection.kind === ReflectionKind.Document) {
                    return groupChildren[0];
                }
                if (isNoneSection(group)) {
                    return groupChildren;
                }
                return {
                    title: group.title,
                    children: groupChildren,
                };
            });
        }
        return null;
    }
    /**
     * Adds a reflection (and optional children) into the accumulator, optionally
     * grouping by folder-like name segments.
     */
    processChildren(acc, child, children) {
        const includeFolders = !this.navigationOptions.excludeFolders;
        const canGroupByFolder = includeFolders && !isQuoted(child.name) && !child.name.startsWith('@');
        if (canGroupByFolder) {
            const titleParts = child.name.split('/');
            if (titleParts.length > 1) {
                let currentLevel = acc;
                let currentItem;
                for (let i = 0; i < titleParts.length - 1; i++) {
                    currentItem = currentLevel?.find((item) => item.title === titleParts[i]);
                    if (!currentItem) {
                        currentItem = {
                            title: titleParts[i],
                            children: [],
                        };
                        currentLevel.push(currentItem);
                    }
                    currentLevel = currentItem.children || [];
                }
                currentLevel.push(this.buildNavigationItem(titleParts[titleParts.length - 1], child, children));
                return acc;
            }
        }
        acc.push(this.buildNavigationItem(child.name, child, children));
        return acc;
    }
    /**
     * Creates a navigation item for a reflection.
     */
    buildNavigationItem(title, child, children) {
        return {
            title,
            kind: child.kind,
            path: this.router.getFullUrl(child),
            isDeprecated: child.isDeprecated(),
            ...(children && { children }),
        };
    }
    /**
     * Filters out the entry module item from a list of navigation items.
     */
    filterEntryModule(children, entryModule) {
        return (children || []).filter((child) => child.title !== entryModule);
    }
    /**
     * Determines the child navigation items for a group child reflection.
     */
    getGroupChildChildren(child, includeCategories) {
        if (child instanceof DeclarationReflection &&
            includeCategories &&
            child.categories?.length) {
            return child.categories
                .sort(sortNoneSectionFirst)
                ?.flatMap((category) => {
                const catChildren = this.getCategoryGroupChildren(category);
                if (!catChildren.length)
                    return [];
                if (isNoneSection(category)) {
                    return catChildren;
                }
                return {
                    title: category.title,
                    ...(this.router.hasUrl(category) && {
                        path: this.router.getFullUrl(category),
                    }),
                    children: catChildren,
                };
            })
                .filter((cat) => Boolean(cat));
        }
        return this.getReflectionGroups(child);
    }
}
