<template>
  <win-form draggable resizable :id="id">
    <q-dialog v-model="enums_dialog">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>
            <slot name="close-title">{{ t('enums_title', selectedItem)}}</slot>
          </q-toolbar-title>
          <q-btn flat icon="close" :title="t('btn.close')" v-close-popup />
        </q-toolbar>
        <q-separator />
        <q-card-section class="scroll" style="max-height: 75vh" >
          <table-enums :access="canAccess" :name="enums_name" :multiple="enums_multiple" v-model="enums" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <div class="q-pa-sm">
      <input v-if="exist" :="hidden('id')" />
      <q-checkbox :="register('active', {
        label: t('props.active')
      })" />
      <q-input :="register('name', {
        label: t('props.name'),
        rules: rules.name
      })" />
      <q-input :="register('code', {
        label: t('props.code'),
        rules: rules.code
      })" />
      <q-input :="register('sort', {
        type: 'number',
        label: t('props.sort')
      })" />
      <select-property
          v-if="allow"
          :label="t('join-prototype')"
          :filters="filtersProperty"
          v-model="joinPrototype" />
      <br />
      <x-join-table v-model="data.children" :editable="allow" :show-title="!allow" wrap-cells grid-header :grid="grid">
        <template #default="{isGrid}">
          <x-column field="id" :header="t('props.addon')">
            <template #editor="{data, field, header, index}">
              <input v-if="data.prototype_id" :="hidden('children.'+index+'.prototype_id')" />
              <div class="q-gutter-sm">
                <q-checkbox :="register('children.'+index+'.active', {
                    label: t('props.active')
                  })" />
              </div>
              <div class="q-gutter-sm">
                <q-checkbox :="register('children.'+index+'.required', {
                    label: t('props.required')
                  })" />
              </div>
              <div class="q-gutter-sm">
                <q-checkbox :="register('children.'+index+'.multiple', {
                    label: t('props.multiple')
                  })" />
              </div>
            </template>
          </x-column>
          <x-column field="code" :header="t('props.code')+' / '+t('props.name')">
            <template #editor="{data, field, header, index}">
              <q-input :="register('children.'+index+'.name', {
                  label: t('props.name'),
                      dense: true,
                      square: true,
                })" />
              <q-input :="register('children.'+index+'.code', {
                  label: t('props.code'),
                      dense: true,
                      square: true,
                })" />
            </template>
          </x-column>
          <x-column field="fieldType" :header="t('props.fieldType')+' / '+t('props.postfix')">
            <template #editor="{data, field, header, index}">
              <select-field-type :="component('children.'+index+'.fieldType', {
                  label: t('props.fieldType'),
                      dense: true,
                      square: true
                })" />
              <q-input :="register('children.'+index+'.postfix', {
                  label: t('props.postfix'),
                      dense: true,
                      square: true
                })" />
            </template>
          </x-column>
          <x-column field="listType" :header="t('props.listType')+' / '+t('props.defaultValue')">
            <template #editor="{data, field, header, index}">
              <template v-if="data.fieldType === 'L'">
                <select-list-type :="component('children.'+index+'.listType', {
                    label: t('props.listType')
                  })" />
                <q-btn @click="changeEnums(index)">{{ t('props.enums')}}</q-btn>
              </template>
              <q-input v-else :="register('children.'+index+'.defaultValue', {
                  label: t('props.defaultValue'),
                      dense: true,
                      square: true
                })" />
            </template>
          </x-column>
          <x-column v-if="allow" field="id" :header="t('btn.remove')" :align="isGrid? 'right': 'center'">
            <template #header>
              <q-btn :title="t('btn.add')" size="xs" icon="mdi-plus" color="info" @click.prevent="addChild" />
            </template>
            <template #editor="{data, field, header, index}">
              <q-btn text-color="warning" :title="header" icon="mdi-delete" @click="removeChild(index)" />
            </template>
          </x-column>
        </template>
      </x-join-table>
    </div>
  </win-form>
</template>

<script>
import { watch, computed, ref, onUnmounted } from 'vue'
import winForm from "../../components/windows/winForm";
import xMarkupTable from "../../components/markup-table/xMarkupTable";
import xJoinTable from "../../components/join-table/xJoinTable.vue";
import xColumn from "../../components/join-table/xColumn.vue";

import axios from "../../plugins/axios"

import selectProperty from './components/select-property';
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

import componentsRepository from "./repository/components";
import initEvents from "./utils/component.events";

let id = 1;

export default {
  name: "app-device-component",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-component',
      accessKey: 'device.component',
      ...props
    })
    const $size = useSize()
    const { data, exist, canAccess, register, hidden, component } = useForm({}, {
      name: 'component',
      repository: componentsRepository
    })
    const allow = useAccess().checkHasScope(canAccess.value)
    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});

    const filtersProperty = computed(() => {
      return {
        parent: null,
        prototype: null,
        type: null
      }
    })
    const joinPrototype = computed({
      get: () => null,
      set: (val) => {
        if (!val) {
          return
        }
        axios.get('/device/properties/'+val).then(({data: res}) => {
          res.prototype_id = res.id
          res.id = 'n'+(id++)
          res.sort = Object.keys(data.value.children).length
          data.value.children[res.id] = res;
        })
      }
    })

    onUnmounted(watch(() => data.value, () => {
      if (Array.isArray(data.value.children)) {
        data.value.children = {}
      }
    }))


    return {
      grid: useGrid(800, {xs: 1, sm: 2}),t:  useI18n().t,
      data, exist, canAccess, register, hidden, component, filtersProperty, joinPrototype, allow
    }
  },
  components: { winForm, selectProperty, selectFieldType, selectListType, tableEnums, xMarkupTable, xJoinTable, xColumn },
  data () {
    return {
      rules: {
        name: [
          // v => !!v || 'Название бязательно',
        ],
        code: [
          // /v => !!v || 'Code бязателен',
        ],
      },
      selectedIndex: null,
      enums_dialog: false,
    }
  },
  methods: {
    changeEnums (index) {
      this.selectedIndex = index
      this.enums_dialog = true
    },
    addChild () {
      let addItem = {
        'id': 'n'+(id++),
        'active': true,
        'required': false,
        'multiple': false,
        'code': "",
        'name': "",
        'sort': Object.keys(this.data.children).length,
        'fieldType': "S",
        'listType': "S",
        'postfix': null,
        'defaultValue': null,
        'enums': {}
      }
      this.data.children[addItem.id] = addItem;
    },
    removeChild (index) {
      delete this.data.children[index]
    },
  },
  computed: {
    selectedItem () {
      return this.data.children[this.selectedIndex]
    },
    enums: {
      get () {
        return this.data.children[this.selectedIndex].enums
      },
      set (val) {
        this.data.children[this.selectedIndex].enums = val
      }
    },
    enums_name () {
      return 'component[children]['+this.selectedIndex+'][enums]'
    },
    enums_multiple () {
      return this.selectedItem.multiple
    }
  }
}
</script>

<style scoped>

</style>