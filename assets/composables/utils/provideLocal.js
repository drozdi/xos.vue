import { getCurrentInstance, provide } from 'vue'
import { localProvidedStateMap } from './map'

export const provideLocal = (key, value) => {
    const instance = getCurrentInstance()?.proxy
    if (instance == null) {
        throw new Error('provideLocal must be called in setup')
    }
    if (!localProvidedStateMap.has(instance)) {
        localProvidedStateMap.set(instance, Object.create(null))
    }
    const localProvidedState = localProvidedStateMap.get(instance)
    localProvidedState[key] = value
    provide(key, value)
}