<template>
  <win-form draggable resizable :id="id">
    <template #default>
      <div class="q-pa-sm">
        <x-join-table v-model="data.keys" editable wrap-cells :grid="grid" grid-header>
          <x-column field="software_id" :header="t('props.software')">
            <template #editor="{data, field, header, index}">
              <select-software :="component(index+'.software_id', {
                  filters: filters,
                })" :label="header" dense square />
            </template>
          </x-column>
          <x-column field="typeKey" :header="t('props.typeKey')">
            <template #editor="{data, field, header, index}">
              <select-license-key-type :="component(index+'.typeKey')" :label="header" dense square />
            </template>
          </x-column>
          <x-column field="value" :header="t('props.key')">
            <template #editor="{data, field, header, index}">
              <q-input :="register(index+'.value')" :label="header" dense square />
            </template>
          </x-column>
          <x-column field="actived">
            <template #editor="{data, field, header, index}">
              <q-input :="register(index+'.actived')" :label="header" dense square />
            </template>
            <x-column :header="t('props.actived')" />
            <x-column>
              <template #header>
                <q-btn :title="t('btn.add')" color="info" icon="mdi-plus" size="xs" @click="add" />
              </template>
            </x-column>
          </x-column>
        </x-join-table>
      </div>
    </template>
  </win-form>
</template>

<script>
import { computed } from 'vue'
import winForm from "../../components/windows/winForm";
import xJoinTable from "../../components/join-table/xJoinTable";
import XColumn from "../../components/join-table/xColumn";

import SelectSoftware from "./components/select-software";
import SelectLicenseKeyType from "./components/select-license-key-type";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm, useSubForm} from "../../composables/useForm";
import initEvents from "./utils/license.key.events";

import licenseKeyRepository from "./repository/licenseKey";
import { useGrid } from "../../composables/useGrid";

let ii = 0
export default {
  name: "app-device-license-key",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-license-key',
      accessKey: 'device.license',
      ...props
    })
    const $size = useSize()
    const { data } = useForm({}, {
      //name: 'keys',
      repository: licenseKeyRepository
    })
    const { register, component, hidden } = useSubForm('keys')
    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});
    const filters = computed(() => {
      return { type: data.value.type_id }
    })
    const grid = useGrid(800, {xs: 1, sm: 2})
    function add () {
      let id = 'n'+(ii++)
      data.value.keys[id] = {
        id: id,
        software_id: 0,
        typeKey: 'VLK',
        value: '',
        actived: ''
      }
    }
    return {
      data, register, component, hidden, filters, add, grid,
      t: useI18n().t, checkHasScope: useAccess().checkHasScope
    }
  },
  components: { winForm, xJoinTable, XColumn, SelectSoftware, SelectLicenseKeyType },
}
</script>

<style scoped>

</style>