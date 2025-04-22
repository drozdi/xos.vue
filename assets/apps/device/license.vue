<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="software" :label="t('tab-software')" />
      </q-tabs>
    </template>
    <template #default>
      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="general">
          <input v-if="exist" :="hidden('id')" />
          <q-input :="register('code', {
            label: t('props.code')
          })" />
          <select-license-type :="component('type', {
            label: t('props.type')
          })" />
          <q-input :="register('no', {
            label: t('props.no')
          })" />
          <q-input :="register('autNo', {
            label: t('props.autNo')
          })" />
          <q-input :="register('dateReal', {
            label: t('props.dateReal'),
            mask: '##-##-####'
          })">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="data.dateReal" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-tab-panel>
        <q-tab-panel name="software">
          <x-join-table v-model="data.softwares" editable grid-header wrap-cells :grid="grid">
            <x-column field="type_id" :header="t('props.typeSoft')">
              <template #editor="{data, field, header, index}">
                <select-software-type :="component('softwares.'+index+'.type_id')" :label="header" dense square />
              </template>
            </x-column>
            <x-column field="software_id" :header="t('props.typeSoft')">
              <template #editor="{data, field, header, index}">
                <select-software v-memo="[data.type_id, data.software_id]" :="component('softwares.'+index+'.software_id', {
                    filters: {type: data.type_id}
                  })" :label="header" dense square />
              </template>
            </x-column>
            <x-column field="count">
              <template #editor="{data, field, header, index}">
                <q-input :="register('softwares.'+index+'.count', {
                    label: header,
                    dense: true,
                    square: true
                  })" />
              </template>
              <x-column :header="t('props.count')" />
              <x-column>
                <template #header>
                  <q-btn :title="t('btn.add')" color="info" size="xs" icon="mdi-plus" @click="add" />
                </template>
              </x-column>
            </x-column>
          </x-join-table>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </win-form>
</template>

<script>
import { onUnmounted, watch, reactive } from "vue";
import winForm from "../../components/windows/winForm";
import xJoinTable from "../../components/join-table/xJoinTable";
import xColumn from "../../components/join-table/xColumn";

import selectLicenseType from './components/select-license-type'
import selectSoftware from './components/select-software'
import selectSoftwareType from './components/select-software-type'

import { isObject } from "../../utils/fns";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useGrid} from "../../composables/useGrid";

import licensesRepository from "./repository/license";
import initEvents from "./utils/license.events";

export default {
  name: "app-device-license",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-license',
      accessKey: 'device.license',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, exist, register, component, hidden } = useForm({}, {
      name: 'license',
      repository: licensesRepository
    })
    initEvents($app)
    data.value = {
      softwares: {},
      ...data.value,
    }
    const tab = $sm.join('tab', 'general', props)
    $app.on('saved', ($event) => {emit('saved', $event)})
    onUnmounted(watch(() => data.value, () => {
      if (!isObject(data.value.softwares)) {
        data.value.softwares = {}
      }
    }))
    const grid = useGrid(800, {xs: 1, sm: 2})
    let ii  = 0
    function add () {
      let id = 'n'+(ii++);
      data.value.softwares[id] = {
        id: id,
        type_id: 0,
        software_id: 0,
        count: 0
      }
    }
    return {
      data, exist, register, component, hidden, tab, add, grid,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  components: { winForm, selectLicenseType, selectSoftware, selectSoftwareType, xJoinTable, xColumn },
}
</script>

<style scoped>

</style>