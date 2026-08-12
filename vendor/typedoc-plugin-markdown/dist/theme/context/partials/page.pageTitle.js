import { strikeThrough } from '../../../libs/markdown/index.js';
import { escapeChars, unEscapeChars } from '../../../libs/utils/index.js';
import { i18n, ReflectionKind, } from 'typedoc';
export function pageTitle() {
    const textContentMappings = this.options.getValue('textContentMappings');
    const pageTitleTemplates = this.options.getValue('pageTitleTemplates');
    const hasCustomPageTitle = this.options.isSet('pageTitleTemplates');
    const indexPageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.['index']
        : textContentMappings?.['title.indexPage'];
    const modulePageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.['module']
        : textContentMappings?.['title.modulePage'];
    const memberPageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.['member']
        : textContentMappings?.['title.memberPage'];
    const page = this.page;
    if (this.urlTo(page.model) === this.urlTo(page.project) &&
        [ReflectionKind.Project, ReflectionKind.Module].includes(page.model.kind)) {
        if (typeof indexPageTitle === 'string') {
            return this.helpers.getProjectName(indexPageTitle, page);
        }
        return indexPageTitle({
            projectName: page?.project?.name,
            version: page?.project?.packageVersion,
        });
    }
    const typeParameters = this.helpers.getTypeParameters(page.model.typeParameters, { includeBackticks: false });
    const rawTypeParameters = unEscapeChars(typeParameters ?? '');
    const modelName = `${page.model.name}${this.helpers.hasSignatures(page.model) ? '()' : ''}`;
    const rawName = `${modelName}${rawTypeParameters?.length ? `<${rawTypeParameters}>` : ''}`;
    const name = `${escapeChars(modelName)}${typeParameters?.length ? `${this.helpers.getAngleBracket('<')}${typeParameters}${this.helpers.getAngleBracket('>')}` : ''}`;
    const kind = ReflectionKind.singularString(page.model.kind);
    const keyword = getKeyword(page.model);
    const codeKeyword = getCodeKeyword(page.model);
    const group = getOwningGroupTitle(page.model);
    const shouldStrikethrough = page.model?.isDeprecated() &&
        this.options.getValue('strikeDeprecatedPageTitles');
    if ([ReflectionKind.Module, ReflectionKind.Namespace].includes(page.model.kind)) {
        let renderedModuleTitle;
        if (typeof modulePageTitle === 'string') {
            renderedModuleTitle = getFromString(modulePageTitle, {
                rawName,
                name,
                kind,
            });
        }
        else {
            renderedModuleTitle = modulePageTitle({
                name,
                kind,
                rawName,
            });
        }
        return shouldStrikethrough
            ? strikeThrough(renderedModuleTitle)
            : renderedModuleTitle;
    }
    let rendererMemberPageTitle;
    if (typeof memberPageTitle === 'string') {
        rendererMemberPageTitle = getFromString(memberPageTitle, {
            rawName,
            name,
            group,
            kind,
            keyword,
            codeKeyword,
        });
    }
    else {
        rendererMemberPageTitle = memberPageTitle({
            rawName,
            name,
            kind,
            keyword,
            codeKeyword,
            group,
        });
    }
    return shouldStrikethrough
        ? strikeThrough(rendererMemberPageTitle)
        : rendererMemberPageTitle;
}
function getOwningGroupTitle(reflection) {
    const parent = reflection.parent;
    if (!parent?.groups)
        return undefined;
    for (const group of parent.groups) {
        if (group.children.some((child) => child.name === reflection.name)) {
            return group.title;
        }
    }
    return undefined;
}
function getKeyword(model) {
    if (model.flags.isAbstract) {
        return i18n.flag_abstract();
    }
    return undefined;
}
function getCodeKeyword(model) {
    if (model.flags.isAbstract) {
        return 'abstract';
    }
    return undefined;
}
function getFromString(textContent, config) {
    return textContent
        .replace('{kind}', config.kind)
        .replace('{rawName}', config.rawName)
        .replace('{name}', config.name)
        .replace('{keyword}', config.keyword ?? '')
        .replace('{codeKeyword}', config.codeKeyword ?? '')
        .replace('{group}', config.group ?? '')
        .replace(/``/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
