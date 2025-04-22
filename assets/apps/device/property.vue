<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="prototype" :label="t('tab-prototype')" />
      </q-tabs>
    </template>
    <template #default>
      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="general">
          <input v-if="exist" :="hidden('id')" />
          <div class="q-gutter-sm">
            <q-checkbox :="register('active', {
              label: t('props.active')
            })" />
          </div>
          <div class="q-gutter-sm">
            <q-checkbox :="register('required', {
              label: t('props.required')
            })" />
          </div>
          <div class="q-gutter-sm">
            <q-checkbox :="register('multiple', {
              label: t('props.multiple')
            })" />
          </div>
          <q-input :="register('name', {
            label: t('props.name')
          })" />
          <q-input :="register('code', {
            label: t('props.code')
          })" />
          <q-input :="register('sort', {
            type: 'number',
            label: t('props.sort')
          })" />
          <select-field-type :="component('fieldType', {
            label: t('props.fieldType')
          })" />
          <template v-if="data.fieldType == 'L'">
            <select-list-type :="component('listType', {
              label: t('props.listType')
            })" />
            <table-enums :="component('enums', {
              multiple: data.multiple,
              access: canAccess
            })" />
          </template>
          <template v-else>
            <q-input :="register('defaultValue', {
              label: t('props.defaultValue')
            })" />
          </template>
        </q-tab-panel>
        <q-tab-panel name="prototype">
          <x-row class="q-col-gutter-x-md" :grid="{xs: 1, sm: 2}" v-if="allow">
            <div class="col col-6">
              <select-device-property
                  v-model="joinComponent"
                  :label="t('join-to-component')"
                  :filters="joinComponentFilters" />
            </div>
            <div class="col col-6">
              <select-prototype
                  v-model="joinProperty"
                  source="/device/properties/props"
                  :label="t('join-to-property')" />
            </div>
          </x-row>
          <br />
          <x-join-table v-model="data.varieties" :editable="allow" :show-title="!allow" wrap-cells grid-header :grid="grid">
            <template #default="{isGrid}">
              <x-column field="id" :header="t('props.type')">
                <template #body="{data, field, header, index}">
                  <div class="text-subtitle2">{{data.title}}</div>
                  <div class="text-caption">{{data.subTitle}}</div>
                  <input v-if="data.id" :="hidden('varieties.'+index+'.id')">
                  <input v-if="data.parent_id" :="hidden('varieties.'+index+'.parent_id')">
                </template>
              </x-column>
              <x-column field="name" :header="t('props.name')">
                <template #editor="{data, field, header, index}">
                  <q-input :="register('varieties.'+index+'.name', {
                    label: header, dense: true, square: true
                  })" />
                </template>
              </x-column>
              <x-column field="code" :header="t('props.code')">
                <template #editor="{data, field, header, index}">
                  <q-input :="register('varieties.'+index+'.code', {
                    label: header, dense: true, square: true
                  })" />
                </template>
              </x-column>
              <x-column field="id" :header="t('props.addon')">
                <template #editor="{data, field, header, index}">
                  <div class="q-gutter-sm">
                    <q-checkbox :="register('varieties.'+index+'.active', {
                      label: t('props.active'),
                    })" />
                  </div>
                  <div class="q-gutter-sm">
                    <q-checkbox :="register('varieties.'+index+'.required', {
                      label: t('props.required'),
                    })" />
                  </div>
                  <div class="q-gutter-sm">
                    <q-checkbox :="register('varieties.'+index+'.multiple', {
                      label: t('props.multiple'),
                    })" />
                  </div>
                </template>
              </x-column>
              <x-column v-if="allow" field="id" :header="t('btn.remove')" :align="isGrid? 'right': 'center'">
                <template #editor="{data, field, header, index}">
                  <q-btn :title="t('btn.remove')" text-color="warning" icon="mdi-delete" @click="removeVariant(index)" />
                </template>
              </x-column>
            </template>
          </x-join-table>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </win-form>
</template>

<script>
import { computed, watch, onUnmounted, ref } from 'vue'
import winForm from "../../components/windows/winForm";
import xRow from "../../components/row/xRow";
import xMarkupTable from "../../components/markup-table/xMarkupTable";
import xJoinTable from "../../components/join-table/xJoinTable.vue";
import xColumn from "../../components/join-table/xColumn.vue";

import selectPrototype from "../../components/select-prototype"
import selectDeviceProperty from './components/select-property'
import tableEnums from "./components/table-enums"
import selectFieldType from "./components/select-property-field-type"
import selectListType from "./components/select-property-list-type"

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useGrid} from "../../composables/useGrid";
import propertiesRepository from "./repository/properties";
import initEvents from "./utils/property.events";

let id = 1;

export default {
  name: "app-device-property",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-property',
      accessKey: 'device.property',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const grid = useGrid(800, {xs: 1, sm: 2})
    const { data, exist, canAccess, register, hidden, component } = useForm({}, {
      name: 'property',
      repository: propertiesRepository,
      rules: {
        name: [
          v => !!v || 'Название бязательно',
        ],
        code: [
          v => !!v || 'Code бязателен',
        ]
      }
    })
    const allow = useAccess().checkHasScope(canAccess.value)
    initEvents($app)
    const tab = $sm.join('tab', 'general', props)
    $app.on('saved', ($event) => {emit('saved', $event)});

    onUnmounted(watch(() => data.value, () => {
      if (Array.isArray(data.value.enums)) {
        data.value.enums = {}
      }
      if (Array.isArray(data.value.varieties)) {
        data.value.varieties = {}
      }
    }))

    return {
      t: $i18n.t, data, exist, canAccess, register, hidden, component, tab, grid, allow
    }
  },
  components: {winForm, selectDeviceProperty, selectPrototype, tableEnums, selectFieldType, selectListType, xRow, xMarkupTable, xJoinTable, xColumn},
  computed: {
    joinComponent: {
      get: () => null,
      set (val) {
        if (!val) {
          return
        }
        let vId = 'n'+(id++);
        let addItem = {
          id: vId,
          active: true,
          required: false,
          multiple: false,
          parent_id: val,
          name: this.data.name,
          code: this.data.code,
          title: '',
          subTitle: 'New',
          listType: 'S',
        }
        this.$refs.components.items.forEach((item) => {
          if (item.value == val) {
            addItem.title = item.title;
          }
        });
        this.data.varieties[addItem.id] = addItem;
      }
    },
    joinComponentFilters: () => {
      return {
        'type!': null,
        'parent': null
      }
    },
    joinProperty: {
      get: () => null,
      set (val) {
        if (!val) {
          return
        }
        let addItem = {
          id: val,
          active: true,
          required: false,
          multiple: false,
          name: '',
          code: '',
          title: '',
          subTitle: 'New',
          listType: 'S',
        }
        this.$refs.props.items.forEach((item) => {
          if (item.value == val) {
            addItem.title = item.title;
            addItem.subTitle = item.subtitle || 'New';
            addItem.name = item.name;
            addItem.code = item.code;
            addItem.active = item.active;
            addItem.required = item.required;
            addItem.multiple = item.multiple;
          }
        });
        this.data.varieties[addItem.id] = addItem;
      }
    }
  },
  methods: {
    removeVariant (index) {
      delete this.data.varieties[index];
    },
  }
}
</script>

<style scoped>

</style>