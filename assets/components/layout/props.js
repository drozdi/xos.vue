import { propsFactory } from '../../utils/props'

export const makeLayoutProps = propsFactory({
    view: {
        type: String,
        default: 'hhh lpr fff',
        validator: v => /^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(v.toLowerCase())
    },
    breakpoint: {
        type: Number,
        default: 400
    },
    miniBreakpoint: {
        type: Number,
        default: 700
    },
    isLeft: {
        type: Boolean,
        default: false
    },
    isRight: {
        type: Boolean,
        default: false
    },
    isHeader: {
        type: Boolean,
        default: false
    },
    isFooter: {
        type: Boolean,
        default: false
    },
    resizable: {
        type: Boolean,
        default: false
    },
    lw: {
        type: Number,
        default: 150
    },
    rw: {
        type: Number,
        default: 150
    },
    lwMin: {
        type: Number,
        default: 0,
        validator: function (val) {
            return val >= 0;
        }
    },
    rwMin: {
        type: Number,
        default: 0,
        validator: function (val) {
            return val >= 0;
        }
    },
    lwMaz: {
        type: Number,
        default: null,
        validator: function (val) {
            return val >= 0;
        }
    },
    rwMax: {
        type: Number,
        default: null,
        validator: function (val) {
            return val >= 0;
        }
    }
}, 'x-layout')

export default makeLayoutProps()