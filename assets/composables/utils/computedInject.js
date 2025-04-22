import { computed } from 'vue'
import { injectLocal } from "./injectLocal";

export function computedInject (key, options = () => {}, defaultSource = () => {}, treatDefaultAsFactory = false) {
    let source = injectLocal(key) || undefined
    if (defaultSource) {
        source = injectLocal(key, defaultSource)
    }
    if (treatDefaultAsFactory) {
        source = injectLocal(key, defaultSource, treatDefaultAsFactory)
    }
    if (typeof options === 'function') {
        return computed(ctx => options(source, ctx))
    } else {
        return computed({
            get: ctx => options.get(source, ctx),
            set: options.set,
        })
    }
}