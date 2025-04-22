import { propsFactory } from '../../utils/props'
import { makeWindowProps } from "../window/props";
import { makeLayoutProps } from "../layout/props";
import { makeTableProps } from "../table/props";

import defWindowProps from '../window/default'
import defLayoutProps from '../layout/default'
import defTableProps from '../table/default'

export const defWinTableProps = {
    ...defWindowProps,
    ...defLayoutProps,
    ...defTableProps,
    source: null,
    remove: null,
    filters: () => ({}),
    icons: () => (['collapse', 'fullscreen', 'close'])
}
export const makeWinTableProps = propsFactory({
    ...makeWindowProps(),
    ...makeLayoutProps(),
    ...makeTableProps(),
    source: {
        type: String,
        default: null
    },
    remove: {
        type: String,
        default: null
    },
    filters: {
        type: Object,
        default: () => ({})
    },
}, 'win-table')

export default makeWinTableProps()