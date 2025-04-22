import { camelize } from '../utils/string'
import { createInjectionState } from "./utils/createInjectionState"
import { settingManager } from "../apps/core"
import { getCurrentInstance, onMounted, onUnmounted, nextTick, computed, ref, watch } from "vue"
import { smKey } from './provide'

export function useSetting (smKey = '') {
    smKey = provideSetting(injectSetting(smKey))
    let smType = getCurrentInstance()?.type.name || ''
    smType = smType.toUpperCase().split('-');
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
    let sm = {
        set (key, val) {
            return val
        },
        get (key, val, type = null) {
            return val
        },
        remove (key) {}
    }
    if (settingManager[smType] && smKey) {
        sm = settingManager[smType].sub(smKey)
    } else if (smKey === "core") {
        sm = settingManager['APP'].sub(smKey)
    }
    let smActive = false
    onMounted(() => {
        nextTick(() => {
            smActive = true
        })
    })
    onUnmounted(() => {
        sm.remove()
    })
    return {
        sm,
        key: smKey,
        type: smType,
        active (active = true) {
            smActive = active
        },
        set (key, val) {
            smActive && sm.set(key, val)
            return val
        },
        get (key, val, type = null) {
            return sm.get(key, val, type)
        },
        save (fn = () => {}) {
            let args = [].slice.call(arguments, 1)
            let old = smActive
            smActive = true
            fn(...args)
            smActive = old
        },
        noSave (fn = () => {}) {
            let args = [].slice.call(arguments, 1)
            let old = smActive
            smActive = false
            fn(...args)
            smActive = old
        },
        join (name, def = null) {
            const props = getCurrentInstance()?.props || {}
            let state = ref(this.get(name, props[camelize('sm-'+name)] || def))
            onUnmounted(watch(() => state.value, (value) => {
                this.set(name, value)
            }, { deep: true }))
            return state
        }
    }

}

const [provideSetting, injectSetting] = createInjectionState((key) => {
    return key
}, {
    injectionKey: smKey
});

export {
    provideSetting,
    injectSetting
}