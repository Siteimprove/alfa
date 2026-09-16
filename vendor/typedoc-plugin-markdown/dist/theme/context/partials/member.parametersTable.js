import { backTicks, htmlTable, table } from '../../../libs/markdown/index.js';
import { removeLineBreaks } from '../../../libs/utils/index.js';
import { i18n, ReflectionKind, ReflectionType, } from 'typedoc';
export function parametersTable(model) {
    const tableColumnsOptions = this.options.getValue('tableColumnSettings');
    const leftAlignHeadings = tableColumnsOptions.leftAlignHeaders;
    const parseParams = (current, acc) => {
        const shouldFlatten = current.type?.declaration?.kind === ReflectionKind.TypeLiteral &&
            current.type?.declaration?.children;
        return shouldFlatten
            ? [...acc, current, ...flattenParams(current)]
            : [...acc, current];
    };
    const flattenParams = (current) => {
        return current.type?.declaration?.children?.reduce((acc, child) => {
            const childObj = {
                ...child,
                name: `${current.name}.${child.name}`,
            };
            return parseParams(childObj, acc);
        }, []);
    };
    const showDefaults = !tableColumnsOptions.hideDefaults && hasDefaultValues(model);
    const parsedParams = model.reduce((acc, current) => parseParams(current, acc), []);
    const hasComments = parsedParams.some((param) => Boolean(param.comment));
    const headers = [
        ReflectionKind.singularString(ReflectionKind.Parameter),
        i18n.theme_type(),
    ];
    if (showDefaults) {
        headers.push(i18n.theme_default_value());
    }
    if (hasComments) {
        headers.push(i18n.theme_description());
    }
    const firstOptionalParamIndex = model.findIndex((parameter) => parameter.flags.isOptional);
    const rows = [];
    parsedParams.forEach((parameter, i) => {
        const row = [];
        const isOptional = parameter.flags.isOptional ||
            (firstOptionalParamIndex !== -1 && i > firstOptionalParamIndex);
        const rest = parameter.flags?.isRest ? '...' : '';
        const optional = isOptional ? '?' : '';
        row.push(`${rest}${backTicks(`${parameter.name}${optional}`)}`);
        if (parameter.type) {
            const displayType = parameter.type instanceof ReflectionType
                ? this.partials.reflectionType(parameter.type, {
                    forceCollapse: true,
                })
                : this.partials.someType(parameter.type);
            row.push(removeLineBreaks(displayType));
        }
        if (showDefaults) {
            row.push(backTicks(this.helpers.getParameterDefaultValue(parameter)));
        }
        if (hasComments) {
            if (parameter.comment) {
                const comments = this.partials.comment(parameter.comment, {
                    isTableColumn: true,
                });
                row.push(comments.length ? comments : '-');
            }
            else {
                row.push('-');
            }
        }
        rows.push(row);
    });
    return this.options.getValue('parametersFormat') == 'table'
        ? table(headers, rows, leftAlignHeadings)
        : htmlTable(headers, rows, leftAlignHeadings);
}
function hasDefaultValues(parameters) {
    const defaultValues = parameters.map((param) => param.defaultValue !== '{}' &&
        param.defaultValue !== '...' &&
        !!param.defaultValue);
    return !defaultValues.every((value) => !value);
}
