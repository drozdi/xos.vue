import { propsFactory } from '../../utils/props'
import {isNumber, isObject, isBoolean} from '../../utils/is'
import xColumn from "./xColumn.vue";
export const makeMarkupTableProps = propsFactory({
    editable: {
        type: [Boolean, Function],
        default: false
    },
    separate: Boolean,
    column: {
        type: xColumn,
        default: null
    },
    expand: {
        type: Boolean,
        default: false
    },
    groupAt: {
        type: String,
        default: 'begin',
        validate: (v) => ['begin', 'end'].includes(v)
    },
    sortKey: String,
    sortDesc: {
        type: Boolean,
        default: false
    },
    modelValue: {
        type: Object,
        default: () => {}
    }
}, 'xJoinTable')

export default makeMarkupTableProps()