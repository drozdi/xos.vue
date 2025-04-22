import { propsFactory } from '../../utils/props'

export const makeDRProps = propsFactory({
    w: {
        type: [Number, String],
        default: 'auto',
        validator: function (val) {
            if (typeof val === 'number') {
                return val > -1;
            }
            return val === 'auto' || val.substr(-1) === '%';
        }
    },
    h: {
        type: [Number, String],
        default: 'auto',
        validator: function (val) {
            if (typeof val === 'number') {
                return val > -1;
            }
            return val === 'auto' || val.substr(-1) === '%';
        }
    },
    x: {
        type: [Number, String],
        default: 'center',
        validator: function (val) {
            if (typeof val === 'number') {
                return val > -1;
            }
            return val === 'center' || val === 'left' || val === 'right';
        }
    },
    y: {
        type: [Number, String],
        default: 'center',
        validator: function (val) {
            if (typeof val === 'number') {
                return val > -1;
            }
            return val === 'center' || val === 'top' || val === 'bottom';
        }
    },
    z: {
        type: [String, Number],
        default: 'auto',
        validator: function (val) {
            return typeof val === 'string' ? val === 'auto' : val >= 0
        }
    },
    draggable: {
        type: Boolean,
        default: false
    },
    resizable: {
        type: Boolean,
        default: false
    },
    parent: {
        type: String,
        default: 'body'
    },
    handles: {
        type: Array,
        default: function () {
            return ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
        },
        validator: function (val) {
            const s = ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
            return val.filter(function (val) {
                return s.indexOf(val) > -1;
            }).length === val.length;
        }
    },
    minWidth: {
        type: Number,
        default: 0,
        validator: function (val) {
            return val >= 0;
        }
    },
    minHeight: {
        type: Number,
        default: 0,
        validator: function (val) {
            return val >= 0;
        }
    },
    maxWidth: {
        type: Number,
        default: null,
        validator: function (val) {
            return val >= 0;
        }
    },
    maxHeight: {
        type: Number,
        default: null,
        validator: function (val) {
            return val >= 0;
        }
    },
    lockAspectRatio: {
        type: Boolean,
        default: false
    },
    disableUserSelect: {
        type: Boolean,
        default: true
    }
}, 'draggable-resizable')

export default makeDRProps()