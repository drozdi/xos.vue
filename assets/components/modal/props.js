import { propsFactory } from '../../utils/props'

import { makeDRProps } from "../dr-re/props";

export const makeModalProps = propsFactory({
    ...makeDRProps(),
    icons: {
        type: Array,
        default: () => ['close'],
        validator: function (val) {
            const s = ['collapse', 'fullscreen', 'close'];
            return val.filter(function (val) {
                return  s.indexOf(val) > -1
            }).length === val.length;
        }
    },
    actions: {
        type: Array,
        default: () => []
    },
}, 'x-modal')

export default makeModalProps()