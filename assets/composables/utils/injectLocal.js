import { getCurrentInstance, inject } from 'vue'
import { localProvidedStateMap } from './map'

export const injectLocal = (...args) => {
    const key = args[0]
    const instance = getCurrentInstance()?.proxy
    if (instance == null) {
        throw new Error('injectLocal must be called in setup')
    }
    if (localProvidedStateMap.has(instance) && key in localProvidedStateMap.get(instance)) {
        return localProvidedStateMap.get(instance)[key]
    }
    return inject(...args)
}