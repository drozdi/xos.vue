import {computed, ref, inject} from "vue";

export function createAppForm (repository = null) {
    return {
        props: {
            id: {
                type: Number,
                default: 0
            }
        },
        provide () {
            return {
                'form.id': this.id,
                'form.data': computed({
                    get: () => this.data,
                    set: (val) => this.data = val
                }),
                'form.errors': computed({
                    get: () => this.errors,
                    set: (val) => this.errors = val
                }),
                'form.repository': this.repository
            }
        },
        data () {
            return {
                data: ref({
                    activeFrom: null,
                    activeTo: null
                }),
                errors: ref({}), repository }
        },
        computed: {
            isExist () {
                return !!this.data.id
            },
            canAccess () {
                return this.isExist? 'can_update': 'can_create'
            }
        },
        methods: {
            clearError (field) {
                this.errors[field] = "";
            },
        }
    }
}
export function injectAppForm () {
    return {
        props: {
            id: {
                type: Number,
                default () {
                    return inject('form.id', 0)
                }
            }
        },
        data () {
            return {
                data: inject('form.data', {}),
                errors: inject('form.errors', {}),
                repository: inject('form.repository', null)
            }
        },
        computed: {
            isExist () {
                return !!this.data.id
            },
            canAccess () {
                return this.isExist? 'can_update': 'can_create'
            }
        }
    }
}

export function createAppTable (repository = null) {
    return {
        provide () {
            return {
                'table.repository': repository
            }
        },
        data () {
            return {
                headers: "",
                filters: {},
                groups: []
            }
        },
    }
}
export function injectAppTable () {
    return {
        data () {
            return {
                repository: inject('table.repository', null)
            }
        },
    }
}