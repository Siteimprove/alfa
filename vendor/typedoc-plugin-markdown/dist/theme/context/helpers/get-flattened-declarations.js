import { ReflectionKind } from 'typedoc';
export function getFlattenedDeclarations(model, options) {
    const getFlattenedDeclarations = (current) => {
        return current.type?.declaration?.children?.reduce((acc, child) => {
            child.originalName = child.name;
            const childObj = {
                ...child,
                name: `${current.name}.${child.name}`,
            };
            return parseDeclarations(childObj, acc);
        }, []);
    };
    const parseDeclarations = (current, acc) => {
        const shouldFlatten = current.type?.declaration?.children;
        const isAccessor = current.kind === ReflectionKind.Accessor;
        if (options?.includeSignatures) {
            if (isAccessor) {
                const accessors = [];
                if (current.getSignature) {
                    accessors.push({
                        ...current,
                        getFullName: () => `${current.getFullName()}`,
                        getFriendlyFullName: () => `${current.getFriendlyFullName()}`,
                        name: `get ${current.name}`,
                        type: current.getSignature.type,
                        comment: current.getSignature?.comment,
                    });
                }
                if (current.setSignature) {
                    accessors.push({
                        ...current,
                        getFullName: () => `${current.getFullName()}`,
                        getFriendlyFullName: () => `${current.getFriendlyFullName()}`,
                        name: `set ${current.name}`,
                        type: current.setSignature.type,
                        comment: current.setSignature?.comment,
                    });
                }
                return [...acc, ...accessors];
            }
            if (current.signatures?.length) {
                const signatures = current.signatures.map((signature) => {
                    return {
                        ...current,
                        getFullName: () => `${current.getFullName()}`,
                        getFriendlyFullName: () => `${current.getFriendlyFullName()}`,
                        name: signature.name,
                        type: signature.type,
                        comment: signature.comment,
                    };
                });
                return [...acc, ...signatures];
            }
        }
        return shouldFlatten
            ? [...acc, current, ...getFlattenedDeclarations(current)]
            : [...acc, current];
    };
    return model.reduce((acc, current) => parseDeclarations(current, acc), []);
}
