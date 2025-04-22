import { inject } from 'vue'
import { injectLocal } from '../../composables/utils/injectLocal'
import { propsFactory } from '../../utils/props'
import { smKey, i18nKey, accessKey } from '../../composables/provide'

export const makeAppProps = propsFactory({
    smKey: {
        type: String,
        default: null
    },
    i18nKey: {
        type: String,
        default: null
    },
    accessKey: {
        type: String,
        default: null
    }
}, 'x-app')

export default makeAppProps()