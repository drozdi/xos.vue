import { provideLocal } from './provideLocal'
import { injectLocal } from './injectLocal'

export function createInjectionState (composable, options = {}) {
    const key = options?.injectionKey || Symbol(composable.name || 'InjectionState')
    const useProvidingState = (...args) => {
        const state = composable(...args)
        provideLocal(key, state)
        return state
    }
    const useInjectedState = (defaultValue, treatDefaultAsFactory = false) => injectLocal(key, defaultValue, treatDefaultAsFactory)
    return [useProvidingState, useInjectedState]
}