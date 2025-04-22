import { inject } from "vue";
import { injectLocal } from '../../composables/utils/injectLocal'

export function injectProp (injectKey, name = injectKey) {
    return {
        provide () {
            return {
                [injectKey]: this[name]
            }
        },
        props: {
            [name]: {
                type: String,
                default: () => inject(injectKey, null)
            }
        }
    }
}