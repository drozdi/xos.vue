<template>
  <x-join-table wrap-cells grid-header separate :grid="grid" editable v-model="values">
    <template #default="{ isGrid }">
      <x-column field="name" :header="t('property')">
        <template #body="{ data, index, field, header }">
          <input :="hidden(index+'.property_id')" />
          <input v-if="data.subDeviceId" :="hidden(index+'.subDeviceId')" />
          {{data.name}} ({{data.code}})
        </template>
      </x-column>
      <x-column field="value" :header="t('value')+' / '+t('name')">
        <template #editor="{ data, index, field, header }">
          <property-input :label="t('value')" :name="name+'['+index+']'+'[value]'" :model-value="data" dense square />
        </template>
      </x-column>
      <x-column field="subDeviceSn" :header="t('sn')">
        <template #editor="{ data, index, field, header }">
          <q-input :="register(index+'.sn')" :label="header" dense square />
        </template>
      </x-column>
      <x-column field="id" :header="t('btn.remove')" align="right">
        <template #header>
          <q-btn :title="t('btn.add')" icon="mdi-plus" size="xs" :loading="loading" color="info">
            <q-menu>
              <q-list dense>
                <q-item v-for="prop in properties" clickable v-close-popup @click="addProp(prop.value)">
                  <q-item-section>
                    <q-item-label>{{prop.label}}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption>{{prop.sublabel}}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
        <template #editor="{ data, index, field, header }">
          <q-btn text-color="warning" :title="header" icon="mdi-delete" @click="remove(index)" />
        </template>
      </x-column>
      <x-column field="properties" is-group>
        <template #body="{ index }">
          <form-component-properties :="component(index+'.properties')" />
        </template>
      </x-column>
    </template>
  </x-join-table>

</template>

<script>
import { onUnmounted, onMounted, ref, computed, watch } from "vue";
import xJoinTable from "../../../components/join-table/xJoinTable.vue"
import xColumn from "../../../components/join-table/xColumn.vue"

import propertyInput from './property-input.vue'
import formComponentProperties from './form-component-properties.vue'

import { useI18n } from "../../../composables/useI18n";
import { useAccess } from "../../../composables/useAccess";
import { useGrid } from "../../../composables/useGrid";
import { useSubForm } from "../../../composables/useForm";

import repository from '../repository/devices'


let ii = 0;
export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      require: true
    },
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const values = computed({
      get: () => props.modelValue,
      set: (values) => emit('update:modelValue', values)
    })

    const { register, hidden, component } =  useSubForm(props.name)

    const properties = ref({})
    const loading = ref(true)
    function loadProperties () {
      loading.value = true
      repository.properties(props.type).then(({ data }) => {
        properties.value = data
        loading.value = false
      })
    }

    function addProp (val) {
      repository.property(val).then(({ data }) => {
        let l = {...values.value}
        l['n'+(ii++)] = data
        values.value = l
      })
    }
    function remove (index) {
      let list = {...values.value};
      delete list[index];
      values.value = list;
    }
    onMounted(() => {
      loadProperties()
    })
    onUnmounted(watch(() => props.type, () => {
      loadProperties()
    }))

    return {
      t: useI18n("device.components.table-device-property").t,
      checkHasScope: useAccess().checkHasScope,
      grid: useGrid(500, { xs: 1}),
      properties, addProp, values, loading, remove,
      register, hidden, component }
  },
  components: { xJoinTable, xColumn, propertyInput, formComponentProperties }
}
</script>

<style scoped>

</style>