import { createInjectionState } from "./utils/createInjectionState"
import { getCurrentInstance } from "vue";
import { useI18n as baseI18n } from 'vue-i18n'
import { i18nKey } from './provide'

export function useI18n (i18nKey = null) {
    let list = [].concat(injectI18n([]))
    if (i18nKey && !list.includes(i18nKey)) {
        list.push(i18nKey)
    }
    provideI18n([].concat(list))
    list = list.reverse()
    list.push(getCurrentInstance()?.type.name || '')
    const i18n = baseI18n()
    return {
        t (...args) {
            for (let key of list) {
                if (key && i18n.te(key+'.'+args[0])) {
                    args[0] = key+'.'+args[0]
                    break;
                }
            }
            return i18n.t(...args)
        }
    }
}
/*export function useI18n (i18nKey = null, force = false) {
    i18nKey = force? i18nKey: provideI18n(injectI18n(i18nKey))
    let comKey = getCurrentInstance()?.type.name || ''
    let i18n = baseI18n()
    return {
        i18nKey,
        comKey,
        t (...args) {
            if (i18nKey && i18n.te(i18nKey+'.'+args[0])) {
                args[0] = i18nKey+'.'+args[0]
            } else if (i18n.te(comKey+'.'+args[0])) {
                args[0] = comKey+'.'+args[0]
            }
            return i18n.t(...args)
        }
    }
}*/

const [provideI18n, injectI18n] = createInjectionState((key) => {
    return key
}, {
    injectionKey: i18nKey
});

export {
    provideI18n,
    injectI18n
}