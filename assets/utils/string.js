function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
        var hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
}
/**
 * Hyphenate a camelCase string.
 */
export const hyphenate = cached(function (str) {
    return str.replace(/[A-Z]/, function (c) {
        return '-' + c.toLowerCase();
    }).toLowerCase();
});
/**
 * Camelize a hyphen-delimited string.
 */
export const camelize = cached(function (str) {
    return str.replace(/-(\w)/g, function (_, c) { return c ? c.toUpperCase() : ''; })
});
/**
 * Capitalize a string.
 */
export const capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
});