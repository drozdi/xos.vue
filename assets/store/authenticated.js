import axios from "../plugins/axios";
import { appsManager, scopes, roles } from "../apps/core";

function isRole (state, role) {
    role = (role || "").toUpperCase()
    if (role.substr(0, 5) !== "ROLE_") {
        role = "ROLE_" + role
    }
    return (state.user? state.user.roles || []: []).includes(role)
}

let getters = {};
(['admin', 'root']).forEach((role) => {
    getters['is' + role.charAt(0).toUpperCase() + role.slice(1)] = function (state) {
        return isRole(state, role);
    }
});

export const authentication = {
    namespaced: true,
    state: {
        authenticated: false,
        user: {}
    },
    actions: {
        login ({ dispatch, commit }, { username, password }) {
            return axios.post('/api/login', { username: username, password: password }).then(function ({data}) {
                commit('loginSuccess', data);
                dispatch('authentication/loadAccesses')
            }, function (error) {
                commit('loginFailure', error);
                dispatch('alert/error', error);
            });
        },
        check ({ commit, dispatch }) {
            return axios.post('/api/login').then(({data}) => {
                if (data) {
                    commit('loginSuccess', data);
                } else {
                    commit('loginFailure');
                }
            }, (error) => {
                commit('loginFailure', error);
                dispatch('alert/error', error);
            });
        },
        logout ({ commit, dispatch }) {
            return axios.get('/api/logout').then(function () {
                commit('logout');
            }, function (error) {
                commit('loginFailure', error);
                dispatch('alert/error', error);
            });
        },
        loadOptions () {
            Promise.all([
                axios.get('/api/account/map').then(({data}) => {
                    for (let k in data) {
                        scopes.joinScopes(k, data[k])
                    }
                    return data
                }),
                axios.get('/api/account/roles').then(({data}) => {
                    roles.joinRole(data || [])
                    return data
                }),
                axios.get('/api/account/accesses').then(({data}) => {
                    scopes.joinLevel(data || {})
                    return data
                }),
                axios.get('/api/account/options').then(({data}) => {
                    //console.log(data)
                    return data
                })
            ]).then(() => {
                //console.log(val)
                appsManager.reloadApps()
            })
        }
    },
    mutations: {
        change (state, value) {
            state.authenticated = value
        },
        loginSuccess (state, {user}) {
            state.authenticated = true;
            state.user = user;
            this.dispatch('authentication/loadOptions')
        },
        loginFailure (state) {
            state.authenticated = false;
            state.user = null;
        },
        logout (state) {
            state.authenticated = false;
            state.user = null;
        }
    },
    getters: {
        ...getters,
        isAuth(state) {
            return state.authenticated === true
        },
        user(state) {
            return state.user;
        }
    }
}