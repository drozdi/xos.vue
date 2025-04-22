export function injectProp (target, propName, get, set) {
    Object.defineProperty(target, propName, {
        get,
        set,
        enumerable: true
    })
    return target
}
export function injectProps (target, props) {
    for (const key in props) {
        injectProp(target, key, props[ key ])
    }
    return target
}