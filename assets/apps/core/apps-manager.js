import { createApp } from "vue"
import VueAxios from 'vue-axios'
import config from './config'
import settingManager from './setting-manager'
import {parameterize} from '../../utils/request'
import { provideApp } from '../../composables/provide'

import store from "../../store"
import i18n from "../../plugins/i18n"
import core from "../../plugins/core"
import axios from "../../plugins/axios"
import { Quasar } from "quasar"
import quasarUserOptions from "../../quasar-user-options"
export default {
    id: 0,
    apps: {},
    defs: {},
    alias: {},
    runs: {},
    append (app, path = null, conf = {}) {
        this.alias[app.name] = path || app.name;
        this.defs[app.name] = conf || {};
        this.apps[this.alias[app.name]] = app;
    },
    getApp (instance) {
        instance = instance.$ || instance._instance || instance
        instance = instance.appContext || instance
        return instance.app || instance
    },
    get$App (instance) {
        return this.getApp(instance)._instance.provides[provideApp] || null
    },
    genId () {
        return 'app-'+String(this.id++)
    },
    genPath (conf) {
        return parameterize(conf.pathName || '', conf)
    },
    updateApp (app, data = {}) {
        app = this.getApp(app)
        Object.entries(app._props).forEach(([key, value]) => {
            if (app._props[key] !== undefined && data[key]) {
                app._props[key] = data[key]
            }
        })
    },
    buildApp (proto, conf = {}, mount = true) {
        conf = {...(this.defs[proto.name] || {}), ...conf}
        let pathName = this.genPath(conf);
        if (pathName) {
            if (!this.runs[pathName]) {
                const instance = this.runs[pathName] = createApp(proto, {...conf, pathName })
                this.joinPlugins(instance)
                mount && this.mountApp(instance)
            } else {
                this.get$App(this.runs[pathName])?.active()
            }
            return this.runs[pathName];
        }
        const instance = createApp(proto, conf);
        this.joinPlugins(instance)
        mount && this.mountApp(instance)
        return instance;
    },
    reBuildApp (app) {
        app = this.getApp(app)
        let pathName = app._props.pathName
        app._props.pathName = this.genPath({
            ...app._props,
            pathName: this.defs[app._component.name].pathName
        })
        this.runs[app._props.pathName] = this.runs[pathName]
        this.runs[pathName] = null
    },
    mountApp (app) {
        app = this.getApp(app)
        const wrapper = document.createElement("div");
        document.body.prepend(wrapper);
        app.mount(wrapper);
    },
    createApp (proto, conf = {}, save = true) {
        if (typeof proto === "string" && "@" === proto.substr(0, 1)) {
            proto = this.alias[proto.substr(1)];
        }
        proto = typeof proto === "string"? this.apps[proto]: proto;

        let smKey = null

        if (save) {
            conf.smKey = smKey = this.genId()
        }

        if (smKey === this.buildApp(proto, conf)._props.smKey && save) {
            let runs = settingManager.APP.get('run', []);
            runs.push(smKey)
            settingManager.APP.set(smKey, {
                id: this.id,
                smKey: smKey,
                name: "@"+proto.name,
                conf: conf,
            });
            settingManager.APP.set('run', runs);
        }
    },
    removeApp (app) {
        app = this.getApp(app)
        let smKey = app._props.smKey
        let pathName = app._props.pathName
        let runs = settingManager.APP.get('run', []);
        runs = runs.filter((val) => val != smKey);
        settingManager.APP.remove(smKey)
        settingManager.APP.set('run', runs);
        delete this.runs[pathName]
    },
    reloadApps () {
        let runs = settingManager.APP.get('run', []);
        runs.forEach((smKey) => {
            let info = settingManager.APP.get(smKey, {id: 0, smKey: smKey, name: "", conf: {}})
            this.id = Math.max(info.id, this.id);
            let proto = info.name
            if (typeof proto === "string" && "@" === proto.substr(0, 1)) {
                proto = this.alias[proto.substr(1)]
            }
            proto = typeof proto === "string"? this.apps[proto]: proto
            this.buildApp(proto, info.conf)
        })
    },
    joinPlugins (app) {
        app = this.getApp(app)
        app.use(VueAxios, axios)
        app.use(Quasar, quasarUserOptions)
        app.use(store)
        app.use(i18n)
        app.use(core)
    },
}