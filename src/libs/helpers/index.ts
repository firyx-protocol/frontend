import _ from "lodash";
export const shortenAddress = (address: string, chars = 4): string => {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export const toCamelCase = (obj: unknown): unknown => {
    if (_.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (_.isObject(obj)) {
        return _.reduce(obj, (result, value, key) => {
            const camelKey = _.camelCase(key);
            result[camelKey] = toCamelCase(value);
            return result;
        }, {} as Record<string, unknown>);
    }
    return obj;
}

export const toSnakeCase = (obj: unknown): unknown => {
    if (_.isArray(obj)) {
        return obj.map(v => toSnakeCase(v));
    } else if (_.isObject(obj)) {
        return _.reduce(obj, (result, value, key) => {
            const snakeKey = _.snakeCase(key);
            result[snakeKey] = toSnakeCase(value);
            return result;
        }, {} as Record<string, unknown>);
    }
    return obj;
}