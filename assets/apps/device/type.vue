<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="component" :label="t('tab-component')" />
        <q-tab name="prototype" :label="t('tab-prototype')" />
      </q-tabs>
    </template>
    <template #default>
      <q-dialog v-model="enums_dialog">
        <q-card>
          <q-toolbar>
            <q-toolbar-title>
              <slot name="close-title">{{ t('enums_title', selectedItem) }}</slot>
            </q-toolbar-title>
            <q-btn flat icon="close" :title="t('btn.close')" v-close-popup />
          </q-toolbar>
          <q-card-section class="scroll" style="max-height: 75vh;">
            <table-enums :access="canAccess" :name="enums_name" v-model="enums" :multiple="enums_multiple" />
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="general">
          <input v-if="exist" :="hidden('id')" />
          <q-input :="register('name', {
            label: t('props.name')
          })" />
          <q-input :="register('code', {
            label: t('props.code')
          })" />
          <select-type :="component('parent_id', {
            label: t('props.parent'),
            filters: filtersParent
          })" />
          <q-input :="register('sort', {
            type: 'number',
            label: t('props.sort')
          })" />
        </q-tab-panel>
        <q-tab-panel name="component">
          <x-row :grid="{xs: 2, sm: 3, md: 4, lg: 5, xl: 6}">
            <q-card v-for="item in components" bordered class="col bg-transparent">
              <q-list class="label" dense>
                <q-item tag="label">
                  <q-item-section side>
                    <q-checkbox :="register('components', {
                      val: item.value
                    })" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item.label }}</q-item-label>
                    <q-item-label caption>{{ item.sublabel }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item tag="label" v-for="sub in item.children">
                  <q-item-section>
                    <q-item-label>{{ sub.label }}</q-item-label>
                    <q-item-label caption>{{ sub.sublabel }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox :="register('components', {
                      val: sub.value
                    })" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </x-row>
        </q-tab-panel>
        <q-tab-panel name="prototype">
          <select-prototype ref="props"
              v-if="checkHasScope(canAccess)"
              source="/device/types/properties"
              :label="t('join-property')" v-model="empty"
              @update:modelValue="joinProperty" />
          <br />
          <x-join-table v-model="data.properties" :editable="checkHasScope(canAccess)" :show-title="!checkHasScope(canAccess)" wrap-cells grid-header :grid="grid">
            <x-column field="id" :header="t('props.addon')">
              <template #body="{data, field, header, index}">
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.active', {
                      label: t('props.active')
                    })" />
                </div>
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.required', {
                      label: t('props.required')
                    })" />
                </div>
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.multiple', {
                      label: t('props.multiple')
                    })" />
                </div>
              </template>
              <template #editor="{data, field, header, index}">
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.active', {
                      label: t('props.active')
                    })" />
                </div>
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.required', {
                      label: t('props.required')
                    })" />
                </div>
                <div class="q-gutter-sm">
                  <q-checkbox :="register('properties.'+index+'.multiple', {
                      label: t('props.multiple')
                    })" />
                </div>
              </template>
            </x-column>
            <x-column field="code" :header="t('props.code')+' / '+t('props.name')">
              <template #editor="{data, field, header, index}">
                <q-input :="register('properties.'+index+'.name', {
                    label: t('props.name'),
                    density: 'compact',
                    dense: true,
                    square: true,
                  })" />
                <q-input :="register('properties.'+index+'.code', {
                    label: t('props.code'),
                    density: 'compact',
                    dense: true,
                    square: true
                  })" />
              </template>
            </x-column>
            <x-column field="fieldType" :header="t('props.fieldType')+' / '+t('props.postfix')">
              <template #editor="{data, field, header, index}">
                <select-field-type :="component('properties.'+index+'.fieldType', {
                    label: t('props.fieldType'),
                    dense: true,
                    square: true,
                  })" />
                <q-input :="register('properties.'+index+'.postfix', {
                    label: t('props.postfix'),
                    dense: true,
                    square: true,
                  })" />
              </template>
            </x-column>
            <x-column field="listType" :header="t('props.listType')+' / '+t('props.defaultValue')">
              <template #editor="{data, field, header, index}">
                <template v-if="data.fieldType === 'L'">
                  <select-list-type :="component('properties.'+index+'.listType', {
                      label: t('props.listType'),
                      dense: true,
                      square: true,
                    })" />
                  <q-btn @click="changeEnums(index)" :label="t('props.enums')" />
                </template>
                <q-input v-else :="register('properties.'+index+'.defaultValue', {
                    label: t('props.defaultValue'),
                    dense: true,
                    square: true,
                  })" />
              </template>
            </x-column>
            <x-column v-if="checkHasScope(canAccess)" field="id" header="">
              <template #header>
                <q-btn :title="t('btn.add')" size="xs" icon="mdi-plus" color="info" @click.prevent="addProperty" />
              </template>
              <template #editor="{data, field, header, index}">
                <q-btn text-color="warning" :title="t('btn.remove')" icon="mdi-delete" @click="removeProperty(index)" />
              </template>
            </x-column>
          </x-join-table>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </win-form>
</template>

<script>
import { ref } from 'vue'
import winForm from "../../components/windows/winForm";
import xRow from "../../components/row/xRow";
import xMarkupTable from "../../components/markup-table/xMarkupTable";
import xJoinTable from "../../components/join-table/xJoinTable.vue";
import xColumn from "../../components/join-table/xColumn.vue";

import selectType from './components/select-type';
import selectPrototype from "../../components/select-prototype"
import selectFieldType from './components/select-property-field-type';
import selectListType from './components/select-property-list-type';
import tableEnums from './components/table-enums';

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useGrid} from "../../composables/useGrid";

import typesRepository from "./repository/types";
import propertiesRepository from "./repository/properties";
import initEvents from "./utils/type.events";

let id = 0

export default {
  name: "app-device-type",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-type',
      accessKey: 'device.type',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const empty = ref(null)
    const { data, exist, canAccess, register, hidden, component } = useForm({}, {
      name: 'type',
      repository: typesRepository,
      rules: {
        name: [
          v => !!v || 'Название бязательно',
        ],
        code: [
          v => !!v || 'Code бязателен',
        ],
      }
    })
    initEvents($app)
    const tab = $sm.join('tab', 'general', props)
    $app.on('saved', ($event) => {emit('saved', $event)});
    return {
      data, exist, canAccess, tab, register, hidden, component, empty,
      grid: useGrid(800, {xs: 1, sm: 2}),
      t: useI18n('device-type').t,
      checkHasScope: useAccess('device.type').checkHasScope
    }
  },
  components: { winForm, selectType, selectFieldType, selectListType, tableEnums, selectPrototype, xRow, xMarkupTable, xJoinTable, xColumn },
  data: function () {
    return {
      enums_dialog: false,
      components: [],
      componentsOpened: ['all'],
    }
  },
  methods: {
    changeEnums (index) {
      this.selectedIndex = index
      this.enums_dialog = true
    },
    addProperty () {
      let vId = 'n'+(id++);
      let addItem = {
        id: vId,
        active: true,
        required: false,
        multiple: false,
        parent_id: this.data.id || null,
        name: '',
        code: '',
        prefix: '',
        listType: 'S',
        fieldType: 'S',
        defaultValue: null,
        enums: {},
        enums_def: null
      }
      this.data.properties[addItem.id] = addItem;
    },
    joinProperty (val) {
      if (!val) {
        return
      }
      if (this.data.properties[val]) {
        this.$q.notify({
          message: this.t('exist-property', this.data.properties[val]),
          color: 'warning',
          progress: true
        })
        return
      }
      propertiesRepository.get(val).then(({data}) => {
        delete data.varieties
        if (Array.isArray(data.enums)) {
          data.enums = {}
        }
        this.data.properties[data.id] = data;
        this.$refs.props.reset()
      })
    },
    removeProperty (index) {
      delete this.data.properties[index];
    },
    loadComponents () {
      typesRepository.components().then(({data}) => {
        this.components = data;
      })
    }
  },
  mounted () {
    this.loadComponents()
  },
  computed: {
    filtersParent () {
      return {
        parent: null,
        property: null,
        'id!': this.data.id
      }
    },
    selectedItem () {
      return this.data.properties[this.selectedIndex]
    },
    enums: {
      get () {
        return this.data.properties[this.selectedIndex].enums
      },
      set (val) {
        this.data.properties[this.selectedIndex].enums = val
      }
    },
    enums_multiple () {
      return this.data.properties[this.selectedIndex].multiple
    },
    enums_name () {
      return 'type[properties]['+this.selectedIndex+'][enums]'
    }
  },
  watch: {
    data (value) {
      if (Array.isArray(value.properties)) {
        value.properties = {}
      }
      this.data = value
    },
  }
}
</script>

<style scoped>

</style>