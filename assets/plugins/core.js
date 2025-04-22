import roles from '../apps/core/roles'
import scopes from '../apps/core/scopes'
export default {
    install: (app) => {
        app.config.globalProperties.$isRole = (req) => {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return req.reduce((ret, req) => {
                return ret || roles.isRole(req)
            }, true)
        }
        app.config.globalProperties.$checkHasScope = (req) => {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return req.reduce((ret, req) => {
                return ret && scopes.checkHasScope(req)
            }, true)
        }
    }
}