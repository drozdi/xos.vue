import { onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { EventBus } from 'quasar'
import { appsManager } from '../apps/core'
import { defineReactiveModel } from "./utils/defineReactiveModel"
import { createInjectionState } from "./utils/createInjectionState";
import { provideLocal } from "./utils/provideLocal";
import { provideApp as injectionApp, smKey, i18nKey, accessKey } from './provide'
import { useI18n } from "./useI18n";
import { useAccess } from "./useAccess";
import { useSetting } from "./useSetting";
import {useSize} from "./useSize";

function stateApp (props = {}) {
    return defineReactiveModel({
        instances: {},
        props: {
            ...(getCurrentInstance()?.props || {}),
            ...props
        },
        root: null,
        app: null
    }, {
        ...(new EventBus()),
        ...{
            on: EventBus.prototype.on,
            one: EventBus.prototype.one,
            off: EventBus.prototype.off,
            emit: EventBus.prototype.emit,
        },
        install () {
            useSize()
            this.app = getCurrentInstance()?.appContext?.app;
            if (this.props['smKey']) {
                provideLocal(smKey, this.props['smKey'])
                this.app?.provide(smKey, this.props['smKey'])
            }
            if (this.props['i18nKey']) {
                provideLocal(i18nKey, [this.props['i18nKey']])
                this.app?.provide(i18nKey, [this.props['i18nKey']])
            }
            if (this.props['accessKey']) {
                provideLocal(accessKey, this.props['accessKey'])
                this.app?.provide(accessKey, this.props['accessKey'])
            }
            onMounted(() => {
                this.root = getCurrentInstance().proxy
                this.app = getCurrentInstance().appContext.app;
            })
            onUnmounted(() => {
                appsManager.removeApp(this.app)
            })
            this.on('close', () => {
                this.app.unmount()
                this.app._container.remove()
            })
            'remove close reload'.split(/\s+/).forEach((evt) => {
                this[evt] = (...args) => this.emit(evt, ...args)
            })
        },
        sm (smKey = '') {
            return useSetting(smKey || this.props.smKey || '')
        },
        size (smKey = '') {
            return useSize()
        },
        i18n (i18nKey = null, force = false) {
            return useI18n(i18nKey || this.props.i18nKey || null, force)
        },
        access (accessKey = '') {
            return useAccess(accessKey || this.props.accessKey || '')
        },
        active (...args) {
            this.emit('activated', ...args)
        },
        deActive (...args) {
            this.emit('deactivated', ...args)
        }
    })
}

export function useApp (...args) {
    let state = injectApp();
    if (!state) {
        state = provideApp(...args)
    }
    return state
}

const [provideApp, injectApp] = createInjectionState(stateApp, {
    injectionKey: injectionApp
});

export {
    provideApp,
    injectApp
}