import { propsFactory } from '../../utils/props'
import { makeWindowProps } from "../window/props";
import { makeLayoutProps } from "../layout/props";

import defWindowProps from '../window/default'
import defLayoutProps from '../layout/default'

export const defFormProps = {
    ...defWindowProps,
    ...defLayoutProps,
    id: 0,
    source: null,
    save: null,
    create: null,
    update: null
}
export const makeFormProps = propsFactory({
    ...makeWindowProps(),
    ...makeLayoutProps(),
    id: {
        type: Number,
        default: 0
    },
    source: {
        type: String,
        default: null
    },
    create: {
        type: String,
        default: null
    },
    update: {
        type: String,
        default: null
    }
}, 'win-form')

export default makeFormProps()