import roles from "../apps/core/roles";
import scopes from '../apps/core/scopes'
import props from './props/access'

export default {
    ...props,
    computed: {
        roles () {
            return roles.sub(this.accessKey)
        },
        scopes () {
            return scopes.sub(this.accessKey)
        }
    },
    methods: {
        isRole (req) {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return req.reduce((ret, req) => {
                return ret || this.roles.isRole(req)
            }, true)
        },
        checkHasScope (req) {
            if (!Array.isArray(req)) {
                req = (req || '').split(/\s+/)
            }
            return !!req.reduce((ret, req) => {
                return ret && this.scopes.checkHasScope(req)
            }, true)
        }
    }
}
