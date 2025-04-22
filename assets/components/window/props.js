import { propsFactory } from '../../utils/props'
import { makeDRProps } from "../dr-re/props";

export const makeWindowProps = propsFactory({
    ...makeDRProps(),
    icons: {
        type: Array,
        default: () => ['close'],
        validator (val) {
            const s = ['reload', 'collapse', 'fullscreen', 'close'];
            return val.filter(function (val) {
                return  s.indexOf(val) > -1
            }).length === val.length;
        }
    },
    actions: {
        type: Array,
        default: () => ([])
    },
    title: {
        type: String,
        default: null
    },
    autoClose: {
        type: Boolean,
        default: true
    },
    wmGroup: {
        type: String,
        default: null
    },
    wmSort: {
        type: Number,
        default: 1
    }
}, 'x-window')

export default makeWindowProps()