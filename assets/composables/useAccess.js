import { createInjectionState } from "./utils/createInjectionState"
import roles from "../apps/core/roles";
import scopes from '../apps/core/scopes'
import { accessKey } from './provide'

export function useAccess (accessKey = '') {
    accessKey = provideAccess(injectAccess(accessKey))
    const subRoles = roles.sub(accessKey)
    const subScopes = scopes.sub(accessKey)
    return {
        key: accessKey,
        isRole (req) {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return req.reduce((ret, req) => {
                return ret || subRoles.isRole(req)
            }, true)
        },
        checkHasScope (req) {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return !!req.reduce((ret, req) => {
                return ret && subScopes.checkHasScope(req)
            }, true)
        }
    }
}

const [provideAccess, injectAccess] = createInjectionState((key) => {
    return key
}, {
    injectionKey: accessKey
});

export {
    provideAccess,
    injectAccess
}