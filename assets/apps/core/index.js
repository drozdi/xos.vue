import { createApp } from "vue";

import config from './config'
import settingManager from './setting-manager'
import appsManager from './apps-manager'
import roles from './roles'
import scopes from './scopes'

export { default as config } from './config'
export { default as settingManager } from './setting-manager'
export { default as appsManager } from './apps-manager'
export { default as roles } from './roles'
export { default as scopes } from './scopes'

import accountProfile from "../account/profile";

appsManager.append(accountProfile, "./account/profile", {
    pathName: 'account-profile',
    i18nKey: 'account',
    accessKey: 'account.profile',
    wmGroup: "account-profile",
    wmSort: 1
})
appsManager.createProfile = function (conf) {
    this.createApp("./account/profile", conf);
};

export default {
    $config: config,
    $sm: settingManager,
    $apps: appsManager,
    $scopes: scopes,
    $roles: roles,
    list: {},
    app (app, conf = {}) {
        if (!this.list[app.name]) {
            this.list[app.name] = createApp(app, {...conf})
            appsManager.joinPlugins(this.list[app.name])
        }
        return this.list[app.name];
    },

    joinScopes (app = '', map = {}) {
        this.$scopes.joinScopes(app, map)
    },
    getCanScope (scope) {
        return this.$scopes.getCanScope(scope)
    },
    getLevelScope (scope) {
        return this.$scopes.getLevelScope(scope)
    },
    checkHasScope (scope) {
        return this.$scopes.checkHasScope(scope)
    },
}