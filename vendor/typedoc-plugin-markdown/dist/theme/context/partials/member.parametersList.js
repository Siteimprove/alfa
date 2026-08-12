import { backTicks, heading, horizontalRule, } from '../../../libs/markdown/index.js';
import { escapeChars } from '../../../libs/utils/index.js';
import { i18n, ReflectionKind, ReflectionType, UnionType, } from 'typedoc';
export function parametersList(model, options) {
    const md = [];
    model.forEach((parameter) => {
        const row = [];
        const name = `${escapeChars(parameter.name)}${parameter.flags.isOptional || parameter.defaultValue ? '?' : ''}`;
        row.push(heading(options.headingLevel + 1, name));
        if (parameter.type instanceof UnionType && parameter.type?.types) {
            const hasUsefulTypeDetails = this.helpers.hasUsefulTypeDetails(parameter.type);
            const unionOut = this.partials.someType(parameter.type, {
                forceCollapse: true,
            });
            row.push(unionOut);
            if (parameter.comment) {
                row.push(this.partials.comment(parameter.comment));
            }
            if (hasUsefulTypeDetails) {
                const unions = parameter.type.types
                    .map((type) => getUnionParameterTypeDetails(this, parameter, {
                    headingLevel: options.headingLevel + 1,
                }, type))
                    .filter(Boolean);
                if (unions.length) {
                    row.push(unions.join(horizontalRule()));
                }
            }
        }
        else {
            if (parameter.type instanceof ReflectionType) {
                if (parameter.type.declaration?.signatures) {
                    row.push(this.partials.someType(parameter.type, { forceCollapse: true }));
                }
                row.push(`${'\n\n'}${getReflectionType(this, options, parameter, parameter.type)}`);
            }
            else {
                row.push(getOtherType(this, parameter));
            }
        }
        md.push(row.join('\n\n'));
    });
    return md.join('\n\n');
}
function getOtherType(context, parameter, skipHeading = false) {
    const rest = parameter.flags?.isRest ? '...' : '';
    const identifier = [];
    const md = [];
    if (!skipHeading) {
        identifier.push(context.partials.someType(parameter.type, { forceCollapse: true }));
    }
    if (parameter.defaultValue) {
        identifier.push(' = ' + backTicks(context.helpers.getParameterDefaultValue(parameter)));
    }
    md.push(`${rest}${identifier.join('')}`);
    if (parameter.comment) {
        md.push(context.partials.comment(parameter.comment));
    }
    return md.join('\n\n');
}
function getReflectionType(context, options, parameter, type) {
    const flatten = flattenParams({
        name: parameter.name,
        type,
    }, true);
    const block = [];
    const typeMd = [];
    if (parameter.comment) {
        block.push(context.partials.comment(parameter.comment));
    }
    flatten?.forEach((flat) => {
        const name = [flat.name];
        if (flat.flags.isOptional) {
            name.push('?');
        }
        typeMd.push('\n' + heading(options.headingLevel + 2, name.join('')));
        typeMd.push(getOtherType(context, flat));
    });
    block.push(typeMd.join('\n\n'));
    return block.join('\n\n');
}
function getUnionParameterTypeDetails(context, parameter, options, type) {
    if (!(type instanceof ReflectionType)) {
        return context.partials.someType(type, { forceCollapse: true });
    }
    if (!context.helpers.hasUsefulTypeDetails(type)) {
        return '';
    }
    const isFunction = type.declaration?.signatures?.length;
    const typeOut = context.partials.someType(type, {
        forceCollapse: true,
    });
    return [
        heading(options.headingLevel + 1, isFunction ? i18n.kind_function() : i18n.kind_type_literal()),
        typeOut,
        getReflectionType(context, { headingLevel: options.headingLevel, withComments: false }, parameter, type),
    ].join('\n\n');
}
function flattenParams(current, skip = false) {
    return current.type?.declaration?.children?.reduce((acc, child) => {
        const childObj = {
            ...child,
            name: skip ? child.name : `${current.name}.${child.name}`,
        };
        return parseParams(childObj, acc);
    }, []);
}
function parseParams(current, acc) {
    const shouldFlatten = current.type?.declaration?.kind === ReflectionKind.TypeLiteral &&
        current.type?.declaration?.children;
    return shouldFlatten
        ? [...acc, current, ...flattenParams(current)]
        : [...acc, current];
}
