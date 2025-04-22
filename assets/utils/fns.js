export function isFunction (func) {
    return (
        typeof func === 'function' ||
        Object.prototype.toString.call(func) === '[object Function]'
    )
}
export function isString (val) {
    return typeof val === 'string'
}
export function isBoolean (val) {
    return val === true || val === false
}
export function isArray (val) {
    return Array.isArray(val)
}
export function isObject (obj) {
    return typeof obj === 'object' && !!obj
}
export function minMax (val, min, max) {
    let _min = typeof min === 'number' && !isNaN(min);
    let _max = typeof max === 'number' && !isNaN(max);
    return _min && val < min && min > 0? min:
        _max && val > max && max > 0? max: val;
}