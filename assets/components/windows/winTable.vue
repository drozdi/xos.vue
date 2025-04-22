<template>
  <x-window :icons="['reload', 'collapse', 'fullscreen', 'close']" :title="t('table.title')" >
    <x-layout container is-footer>
      <template #default="args">
        <q-dialog v-if="checkHasScope('can_delete')" v-model="removeDialog" max-width="500px">
          <q-card>
            <q-toolbar>
              <q-toolbar-title>
                <slot name="remove-title" v-bind="{selectedItem}">
                  {{ t("table.remove.title", selectedItem) }}
                </slot>
              </q-toolbar-title>
              <q-btn flat icon="close" @click="removeClose" />
            </q-toolbar>
            <q-card-section>
              <slot name="remove-message" v-bind="{selectedItem}">
                {{ t("table.remove.message", selectedItem) }}
              </slot>
            </q-card-section>
            <q-card-actions align="right">
              <slot name="remove-actions" v-bind="{ selectedItem, close: removeClose, remove: removeConfirm }">
                <q-btn flat color="blue" @click="removeClose" :label="t('btn.no')" />
                <q-btn flat color="blue" @click="removeConfirm" :label="t('btn.yes')" />
              </slot>
            </q-card-actions>
          </q-card>
        </q-dialog>
        <x-table hidePagination :loading="loading" :headers="computedHeaders" :groups="computedGroups">
          <template #item-actions="props">
            <slot name="item-actions" v-bind="{ ...props, addItem, viewItem, editItem, removeItem }">
              <q-item-label :props="props">
                <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="viewItem(props.row)" :title="t('btn.view')" />
                <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="editItem(props.row)" :title="t('btn.edit')" />
                <q-btn v-if="checkHasScope('can_delete')" icon="mdi-delete" @click="removeItem(props.row)" :title="t('btn.remove')" />
              </q-item-label>
            </slot>
          </template>
          <template #body-cell-actions="props">
            <slot name="body-cell-actions" v-bind="{ ...props, addItem, viewItem, editItem, removeItem }">
              <q-td key="actions" :props="props">
                <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="viewItem(props.row)" :title="t('btn.view')" />
                <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="editItem(props.row)" :title="t('btn.edit')" />
                <q-btn v-if="checkHasScope('can_delete')" icon="mdi-delete" @click="removeItem(props.row)" :title="t('btn.remove')" />
              </q-td>
            </slot>
          </template>
          <template v-for="slot in parentSlots" #[slot]="args">
            <slot :name="slot" v-bind="{...args, addItem, viewItem, editItem, removeItem }" />
          </template>
        </x-table>
      </template>
      <template #header="args">
        <slot name="header" v-bind="{ ...args, addItem, pagination, pagesNumber, rowsPerPageOptions }"></slot>
      </template>
      <template #left="args">
        <slot name="left" v-bind="{ ...args, addItem, pagination, pagesNumber, rowsPerPageOptions }"></slot>
      </template>
      <template #right="args">
        <slot name="right" v-bind="{ ...args, addItem, pagination, pagesNumber, rowsPerPageOptions }"></slot>
      </template>
      <template #footer="args">
        <slot name="footer" v-bind="{ ...args, addItem, pagination, pagesNumber, rowsPerPageOptions }">
          <q-btn text-color="blue" :title="t('btn.add')" @click="addItem" icon="mdi-plus-box" />
          <q-space />
          <q-pagination v-model="pagination.page" input :max="pagesNumber" />
          <q-space />
          <q-select dense emit-value v-model="pagination.rowsPerPage" :options="rowsPerPageOptions" />
        </slot>
      </template>
    </x-layout>
  </x-window>
</template>

<script>
import { computed, getCurrentInstance, ref, watch, onMounted, onUnmounted, provide } from 'vue'
import xWindow from "../window/xWindow";

import props from "./table"
import { makeWindowProps, makeLayoutProps } from '../props'
import { propsProvide } from '../../utils/props'

import { parameterize } from "../../utils/request";

import {
  provideTable,
  provideWindowProps,
  provideLayoutProps,
  provideTableProps } from "../../composables/provide";
import XLayout from "../layout/xLayout";
import XTable from "../table/xTable";

import axios from '../../plugins/axios'

import {useI18n} from "../../composables/useI18n"
import {useTable} from "../../composables/useTable"
import {useApp} from "../../composables/useApp"
import {useSize} from "../../composables/useSize"
import {useSetting} from "../../composables/useSetting"
import {useAccess} from "../../composables/useAccess"

export default {
  name: "win-table",
  components: { XTable, XLayout, xWindow },
  props: props,
  emits: ['add', 'view', 'edit', 'removed'],
  setup (props, { emit, slots }) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { items, pagination, rowsPerPageOptions, pagesNumber, isGrouped, repository } = useTable()

    let vm = getCurrentInstance()?.proxy

    function __emit (...args) {
      $app?.emit(...args)
      emit(...args)
    }

    const loading = ref( true)
    const removeDialog = ref(false)
    const selectedItem = ref( {})

    function getMethodList () {
      const {page, rowsPerPage, sortBy, descending} = pagination.value;
      let sort = []
      sortBy && sort.push({
        'key': sortBy,
        'order': descending ? "DESC" : "ASC",
      })
      return repository ? repository.list(props.filters || {}, sort, rowsPerPage, page) :
          axios.post(props.source, JSON.stringify({
            limit: rowsPerPage,
            offset: page,
            sortBy: sort,
            filters: props.filters || {}
          })).then(({data, headers}) => {
            return {
              collection: data,
              total: /(\w+) (\d+)-(\d+)\/(\d+)/g.exec(headers['content-range'])[4]
            }
          }, (error) => {
            return error;
          })
    }
    function getMethodDelete (item = {}) {
      if (repository) {
        return repository.delete(item.id)
      }
      let url = props.remove;
      return axios.delete(parameterize(url, item))
    }
    function loadItems () {
      if ($access.checkHasScope('!can_read')) {
        vm.$q.notify({
            message: $i18n.t('errors.denied'),
            color: 'negative',
            progress: true
        })
        return
      }
      loading.value = true;
      getMethodList().then(({collection, total}) => {
        //items.value = collection;
        items.value.splice(0, items.value.length, ...collection)
        pagination.value.rowsNumber = total;
      }, () => {
        items.value = []
        pagination.value.rowsNumber = 0
      }).finally(() => {
        loading.value = false
      })
    }
    function onReload () {
      loadItems()
    }

    function viewItem (item) {
      __emit('view', item, {

      })
    }
    function addItem (item) {
      __emit('add', item, {
        filters: {...props.filters},
        onSaved: onReload
      })
    }
    function editItem (item) {
      __emit('edit', item, {
        onSaved: onReload
      })
    }
    function removeItem (item = {}) {
      selectedItem.value = {...item}
      removeDialog.value = true
    }
    function removeConfirm () {
      getMethodDelete(selectedItem.value).then(({data, status}) => {
        if (status === 200) {
          loadItems()
          __emit('removed', data)
          removeClose()
        }
      })
    }
    function removeClose () {
      removeDialog.value = false
      selectedItem.value = {}
    }

    const computedGroups = computed(() => {
      let groups = props.groups
      if (typeof groups === "string") {
        groups = groups.split(/\s+/).map((val) => {
          return {
            label: '',
            group: val,
            align: 'left',
            name: '_children',
            field: '_children',
            headerStyle: 'width: 50px',
          }
        })
      }
      return groups
    })
    const computedHeaders = computed(() => {
      let ret = [{ label: '#', name: 'id', field: 'id', align: 'center', headerStyle: 'width: 50px' }]
      props.headers.split(/\s+/).forEach((val) => {
        if (!val) {
          return
        }
        ret.push({
          label: $i18n.t('props.'+val),
          align: 'left',
          name: val,
          field: val,
          sortable: true
        })
      })
      if (true || $access.checkHasScope('can_update') || $access.checkHasScope('can_delete') || $access.checkHasScope('can_read')) {
        ret.push({ label: $i18n.t('table.actions.title'), name: 'actions', field: 'actions', align: 'center', sortable: false })
      }
      return ret
    })
    const parentSlots = computed(() => {
      return Object.keys(slots).filter((slot) => {
        return !['header', 'footer', 'left', 'right', 'item', 'item-actions', 'body-cell-actions'].includes(slot)
      })
    })

    onMounted(() => {
      //console.log(getCurrentInstance())
    })
    onUnmounted(watch(() => pagination.value, (val) => {
      loadItems()
    }, { deep: true }))
    onUnmounted(watch(() => props.filters, (val) => {
      loadItems()
    }, { deep: true }))
    $app?.on('reload', onReload)

    provide(provideWindowProps, propsProvide(props, makeWindowProps))
    provide(provideLayoutProps, propsProvide(props, makeLayoutProps))
    provide(provideTableProps, props)

    return {
      items, pagination, rowsPerPageOptions, pagesNumber, parentSlots, isGrouped, computedHeaders, computedGroups,
      loading, removeDialog, selectedItem,
      t: $i18n.t, checkHasScope: $access.checkHasScope,
      viewItem, addItem, editItem, removeItem, removeConfirm, removeClose
    };
  }
}
</script>

<style lang="scss">

</style>