import { reactive, ref, watch } from 'vue'
import { injectProp } from './injectProp'

export function defineReactiveModel (state, model) {
    const reactiveState = reactive(state)
    for (const name in state) {
        injectProp(
            model,
            name,
            () => reactiveState[name],
            (val) => {
                reactiveState[ name ] = val
            }
        )
    }
    model.install && model.install()
    return model
}
