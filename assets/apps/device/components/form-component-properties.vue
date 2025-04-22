<script>
import { ref, inject, computed } from 'vue'
import propertyInput from './property-input.vue'
import xJoinTable from "../../../components/join-table/xJoinTable.vue";
import xColumn from "../../../components/join-table/xColumn.vue";
import { useI18n } from "../../../composables/useI18n";
import { useForm, useSubForm } from "../../../composables/useForm";

export default {
  components: { xColumn, xJoinTable, propertyInput },
  props: {
    name: {
      type: String,
      require: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const properties = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    const { register, hidden, component } = (useSubForm(props.name) || useForm({}, {
      name: props.name
    }))
    const inTable = !!inject('__x_table', null)
    return {
      t: useI18n("device.components.form-component-properties").t,
      register, hidden, component, properties, inTable
    }
  }
}
</script>

<template>
  <template v-if="inTable">
    <x-column field="name" :header="t('property')">
      <template #body="{ data, field }">
          <div class="q-pl-lg">{{ data[field] }}</div>
      </template>
    </x-column>
    <x-column field="value" :header="t('value')" :size="3">
      <template #editor="{ data, index, field, header }">
        <property-input :name="index+'.value'" :modelValue="data" dense :label="header" />
      </template>
    </x-column>
  </template>
  <x-join-table v-else v-model="properties">
    <x-column field="name" :header="t('property')">
      <template #body="{ data, field }">
        <div class="q-pl-lg">{{ data[field] }}</div>
      </template>
    </x-column>
    <x-column field="value" :header="t('value')">
      <template #editor="{ data, index, field, header }">
        <property-input :name="index+'.value'" :modelValue="data" dense :label="header" />
      </template>
    </x-column>
  </x-join-table>
</template>

<style scoped>

</style>