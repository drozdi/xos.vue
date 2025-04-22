import { propsFactory } from '../../utils/props'
import {isNumber, isObject, isBoolean} from '../../utils/is'
export const makeMarkupTableProps = propsFactory({
    dense: Boolean,
    flat: Boolean,
    bordered: Boolean,
    square: Boolean,
    wrapCells: Boolean,
    gridHeader: Boolean,
    showHead: Boolean,
    showTitle: Boolean,
    grid: {
        type: [Boolean, Number, Object],
        default: false,
        validator: v => isBoolean(v) || isNumber(v) || isObject(v)
    },
    separator: {
        type: String,
        default: 'horizontal',
        validator: v => ['horizontal', 'vertical', 'cell', 'none'].includes(v)
    }
}, 'xMarkupTable')

export default makeMarkupTableProps()