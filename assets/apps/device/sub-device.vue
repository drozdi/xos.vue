<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense inline-label outside-arrows align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="description" :label="t('tab-description')" />
        <q-tab name="properties" :label="t('tab-properties')" />
        <q-tab name="histories" :label="t('tab-histories')" />
        <q-tab name="log" :label="t('tab-log')" />
      </q-tabs>
    </template>
    <input v-if="data.id" type="hidden" name="device[id]" v-model="data.id" />
    <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
      <q-tab-panel name="general">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input :="register('name', {
              label: t('props.name'),
            })" />
            <q-input :="register('sn', {
              label: t('props.sn'),
            })" />
            <q-input :="register('sort', {
              label: t('props.sort'),
              type: 'number'
            })" />
          </div>
          <div class="col-6">
            <template v-if="exist">
              <input :="hidden('id')" />
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{t('props.dateCreated')}}</q-item-label>
                    <q-item-label>{{ data.dateCreated }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{t('props.createdBy')}}</q-item-label>
                    <q-item-label>{{ data.createdBy }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{t('props.xTimestamp')}}</q-item-label>
                    <q-item-label>{{ data.xTimestamp }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{t('props.modifiedBy')}}</q-item-label>
                    <q-item-label>{{ data.modifiedBy }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </div>
        </div>
        <br />
        <q-separator />
        <form-accounting :="component('accounting')" :attach="filterAttach" />
      </q-tab-panel>
      <q-tab-panel name="description">
        <q-input :="register('description', {
          type: 'textarea',
          label: t('props.description'),
        })" />
      </q-tab-panel>
      <q-tab-panel name="properties">
        <form-properties :="component('properties')" :editable="allow" />
      </q-tab-panel>
      <q-tab-panel name="histories">
        <x-join-table v-model="data.histories" show-title :grid="{xs: 2, sm: 3, md: 4, lg: 5, xl: 6}">
          <x-column field="date" header="Дата" />
          <x-column field="place" header="Устройство" />
        </x-join-table>
      </q-tab-panel>
      <q-tab-panel name="log">
        <pre>{{ data.log }}</pre>
      </q-tab-panel>
    </q-tab-panels>
  </win-form>
</template>

<script>
import { watch, computed, ref, onUnmounted, getCurrentInstance, onMounted } from 'vue'
import winForm from "../../components/windows/winForm";
import xJoinTable from "../../components/join-table/xJoinTable";
import xColumn from "../../components/join-table/xColumn";

import formProperties from "./components/form-component-properties.vue";
import formAccounting from "./components/form-accounting.vue";

import { isObject } from "../../utils/is";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useGrid} from "../../composables/useGrid";
import subDevicesRepository from "./repository/sub-devices";
import initEvents from "./utils/device.events";


let ii = 1;

export default {
  name: "app-device-sub-device",
  props: ['id', 'smKey', 'i18nKey', 'accessKey', 'filters'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-sub-device',
      accessKey: 'device.subDevice',
      ...props
    })
    const $sm = useSetting()
    const { data, errors, exist, canAccess, register, hidden, component } = useForm({}, {
      name: 'device',
      repository: subDevicesRepository,
      rules: {}
    })

    const allow =
    initEvents($app)
    const tab = $sm.join('tab', 'general', props)
    $app.on('saved', ($event) => emit('saved', $event));
    $app.on('loaded', () => {
      if (!exist.value && props.filters.type) {
        data.value.type_id = props.filters.type
      }
    })
    data.value = {
      accounting: {},
      histories: {},
      properties: {},
      ...data.value
    }

    onUnmounted(watch(() => data.value, () => {
      if (!isObject(data.value.accounting)) {
        data.value.accounting = {}
      }
      if (!isObject(data.value.properties)) {
        data.value.properties = {}
      }
      if (!isObject(data.value.histories)) {
        data.value.histories = {}
      }
    }))
    const filterAttach = ref({})
    onUnmounted(watch(()=> data.value.type_id, (value) => {
      if (!exist.value) {
        subDevicesRepository.form(value).then(({data: res}) => {
          data.value.properties = res
        })
      }
      subDevicesRepository.attach(value).then(({data: res}) => {
        filterAttach.value = res
      })
    }))

    return {
      data, errors, exist, register, hidden, component, tab, filterAttach,
      t: useI18n().t,
      allow: useAccess().checkHasScope(canAccess.value)
    }
  },
  components: {
    winForm, formProperties, formAccounting, xJoinTable, xColumn }
}
</script>

<style scoped>

</style>