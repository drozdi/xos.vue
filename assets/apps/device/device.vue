<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense inline-label outside-arrows align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="description" :label="t('tab-description')" />
        <q-tab name="property" :label="t('tab-property')" />
        <q-tab name="images" :label="t('tab-images')" />
        <q-tab name="license" :label="t('tab-license')" />
        <q-tab name="location" :label="t('tab-location')" />
        <q-tab name="repair" :label="t('tab-repair')" />
        <q-tab name="log" :label="t('tab-log')" />
      </q-tabs>
    </template>
    <input v-if="data.id" type="hidden" name="device[id]" v-model="data.id" />
    <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
      <q-tab-panel name="general">
        <div class="row">
          <div class="col-6">
            <q-input :="register('name', {
              label: t('props.name'),
            })" />
            <q-input :="register('code', {
              label: t('props.code'),
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
        </div>
        <br />
        <q-separator />
        <form-accounting :="component('accounting')" inNo />
      </q-tab-panel>
      <q-tab-panel name="description">
        <q-input :="register('description', {
          type: 'textarea',
          label: t('props.description'),
        })" />
      </q-tab-panel>
      <q-tab-panel name="property">
        <table-device-property :="component('properties', {
          type: data.typeId
        })" />
      </q-tab-panel>
      <q-tab-panel name="images">
        <q-uploader class="bg-transparent fit" multiple square flat style="max-height: none" batch
                    :factory="uploadFile" @uploaded="reload" url="/device/device/upload"
                    :form-fields="[{name: 'id', value: data.id}]" ref="uploader">
          <template #list="scope">
            <x-row :map="{xs: 2, sm: 3, md: 4, lg: 5, xl: 6}">
              <q-card v-for="file in scope.files" :key="file.__key" flat square class="q-pa-xs col bg-transparent">
                <q-img :src="file.__img.src">
                  <q-item class="absolute-top text-subtitle2">
                    <q-item-section>
                      {{ file.name }}
                    </q-item-section>
                    <q-item-section side>
                      <q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="scope.removeFile(file)" />
                    </q-item-section>
                  </q-item>
                </q-img>
              </q-card>
            </x-row>
          </template>
        </q-uploader>
        <x-row :grid="{xs: 2, sm: 3, md: 4, lg: 5, xl: 6}">
          <q-card v-for="(file, index) in data.images" :key="index" flat square class="q-pa-xs col bg-transparent">
            <q-img :src="file.src">
              <q-item class="absolute-top text-subtitle2">
                <q-item-section>
                  {{ file.name }}
                </q-item-section>
                <q-item-section side>
                  <q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="removeImage(index)" />
                </q-item-section>
              </q-item>
            </q-img>
          </q-card>
        </x-row>
      </q-tab-panel>
      <q-tab-panel name="license">
        <table-device-license :="component('licenses')" />
      </q-tab-panel>
      <q-tab-panel name="location">
        <table-device-location :="component('locations')" />
      </q-tab-panel>
      <q-tab-panel name="repair">
        <table-device-repair :="component('repairs')" />
      </q-tab-panel>
      <q-tab-panel name="log">
        <pre>{{ data.log }}</pre>
      </q-tab-panel>
    </q-tab-panels>
  </win-form>
</template>

<script>
import {watch, computed, ref, onUnmounted, getCurrentInstance, onMounted} from 'vue'
import winForm from "../../components/windows/winForm";
import xRow from "../../components/row/xRow";

import formAccounting from "./components/form-accounting.vue";
import tableDeviceLocation from "./components/table-device-location";
import tableDeviceRepair from "./components/table-device-repair";
import tableDeviceProperty from "./components/table-device-property";
import tableDeviceLicense from "./components/table-device-license";

import { isObject } from "../../utils/fns";


import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import devicesRepository from "./repository/devices";
import initEvents from "./utils/device.events";

let ii = 1;

export default {
  name: "app-device-device",
  props: ['id', 'smKey', 'i18nKey', 'accessKey', 'filters'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-device',
      accessKey: 'device.device',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, errors, exist, canAccess, register, hidden, component } = useForm({}, {
      name: 'device',
      repository: devicesRepository,
      rules: {

      }
    })
    initEvents($app)
    const tab = $sm.join('tab', 'general', props)
    $app.on('saved', ($event) => {emit('saved', $event)});
    data.value = {
      accounting: {},
      licenses: {},
      locations: {},
      repairs: {},
      properties: {},
      images: {},
      ...data.value,
    }
    const uploader = ref(null)
    onUnmounted(watch(() => data.value, () => {
      if (!isObject(data.value.accounting)) {
        data.value.accounting = {}
      }
      if (!isObject(data.value.properties)) {
        data.value.properties = {}
      }
    }))
    onMounted(() => {

    })
    $app.on('loaded', () => {
      if (!exist.value && props.filters.type) {
        data.value.typeId = props.filters.type
      }
    })
    function uploadFile (files) {
      return {
        fieldName: (file) => {
          return 'device[images]['+(ii++)+']'
        }
      }
    }
    function removeImage (index) {
      delete data.value.images[index]
    }
    function reload () {
      $app.emit('reload')
      uploader.value.reset()
    }
    return {
      data, errors, exist, canAccess, register, hidden, component, tab,
      t: $i18n.t, checkHasScope: $access.checkHasScope, uploadFile, removeImage, reload, uploader
    }
  },
  components: { formAccounting, winForm, tableDeviceLocation, tableDeviceRepair, tableDeviceProperty, tableDeviceLicense, xRow }
}
</script>

<style scoped>

</style>