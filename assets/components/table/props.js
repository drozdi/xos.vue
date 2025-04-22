import { propsFactory } from '../../utils/props'

export const makeTableProps = propsFactory({
    hidePagination: {
        type: Boolean,
        default: false
    },
    headers: {
        type: [String, Array],
        default: () => ([])
    },
    groups: {
        type: [String, Array],
        default: () => ([])
    },
    mobile: {
        type: Number,
        default: 500
    }
}, 'win-table')

export default makeTableProps()