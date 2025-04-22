import { appsManager, settingManager } from "../apps/core"
import props from './props/setting'

export default {
    ...props,
    data () {
        let smType = this.$options.name.toUpperCase().split('-');
        switch (smType[0]) {
            case 'APP':
                smType = 'APP'
                break;
            case 'X':
                smType = smType[1]
                break;
            case 'WIN':
                smType = smType[1]
                break;
            default:
                smType = null
                break;
        }
        return {
            smType: smType,
            _smActive: true,
        }
    },
    computed: {
        sm () {
            if (settingManager[this.smType] && this.smKey) {
                return settingManager[this.smType].sub(this.smKey)
            } else if (this.smKey === "core") {
                return settingManager['APP'].sub(this.smKey)
            }
            return {
                set (key, val) {
                    return val
                },
                get (key, val, type = null) {
                    return val
                },
                remove (key) {}
            };
        },
    },
    methods: {
        smActive (active = true) {
            this._smActive = active
        },
        smSet (key, val) {
            this._smActive && this.sm.set(key, val)
            return val
        },
        smGet (key, val, type = null) {
            return this.sm.get(key, val, type)
        },
        smSave (fn = () => {}) {
            let args = [].slice.call(arguments, 1)
            let old = this._smActive
            this._smActive = true
            fn.apply(this, args)
            this._smActive = old
        },
        smNoSave (fn = () => {}) {
            let args = [].slice.call(arguments, 1)
            let old = this._smActive
            this._smActive = false
            fn.apply(this, args)
            this._smActive = old
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.smActive(true)
        })
    },
    unmounted () {
        this.sm.remove();
    }
}