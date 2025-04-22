import { ref, computed } from "vue"
import { defineReactiveModel } from "./utils/defineReactiveModel"
import { createInjectionState } from "./utils/createInjectionState"
import { provideAppTable } from './provide'
import { useI18n } from './useI18n'


function stateTable (repository = null) {
    const $i18n = useI18n()
    const items = ref([])
    const pagination = ref({
        page: 1,
        sortBy: null,
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
    })
    const rowsPerPageOptions = ref([
        {value: 3, label: '3'},
        {value: 5, label: '5'},
        {value: 7, label: '7'},
        {value: 10, label: '10'},
        {value: 15, label: '15'},
        {value: 20, label: '20'},
        {value: 25, label: '25'},
        {value: 50, label: '50'},
        {value: -1, label: $i18n.t('btn.all')}
    ])
    const pagesNumber = computed(() => {
        return Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage)
    })
    const isGrouped = computed(() => {
        return items.value.length > pagination.value.rowsPerPage
    })

    return {
        items,
        pagination,
        rowsPerPageOptions,
        pagesNumber,
        isGrouped,
        repository
    }
}

export function useTable (...args) {
    let state = injectTable()
    if (!state) {
        state = provideTable(...args)
    }
    return state
}

const [provideTable, injectTable] = createInjectionState(stateTable, {
    injectionKey: provideAppTable
});

export {
    provideTable,
    injectTable
}