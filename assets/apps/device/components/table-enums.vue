<template>
  <x-join-table v-model="enums" :editable="allow" :show-title="!allow" grid-header>
    <template #default="{ isGrid }">
      <x-column v-if="allow" :header="t('default')" field="id" :align="isGrid? 'left': 'center'">
        <template #editor="{data, index}">
          <input type="hidden" :name="name+'['+index+'][sort]'" v-model="data.sort">
          <q-checkbox v-if="multiple" :="component(index+'.default')" size="xs" />
          <q-radio v-else v-model="value" :val="data.id" size="xs" />
        </template>
      </x-column>
      <x-column field="code" :header="t('code')">
        <template #editor="{data, field, header, index}">
          <q-input :="register(index+'.code')"
                   hide-bottom-space dense square
                   :label="header"
                   :rules="rules.code"  />
        </template>
      </x-column>
      <x-column field="name" :header="t('name')">
        <template #editor="{data, field, header, index}">
          <q-input :="register(index+'.name')"
                   hide-bottom-space dense square
                   :label="header"
                   :rules="rules.code"  />
        </template>
      </x-column>
      <x-column v-if="allow" field="id" :header="t('btn.remove')" :align="isGrid? 'right': 'center'">
        <template #header="args">
          <q-btn :title="t('btn.add')" @click="add" color="info" icon="mdi-plus" size="xs" />
        </template>
        <template #editor="{header, index}">
          <q-btn text-color="warning" :title="header" icon="mdi-delete" @click="remove(index)" dense square />
        </template>
      </x-column>
    </template>
  </x-join-table>
</template>

<script>
import { computed, ref, onUnmounted, watch } from 'vue'
import xMarkupTable from "../../../components/markup-table/xMarkupTable";
import xJoinTable from "../../../components/join-table/xJoinTable";
import xColumn from "../../../components/join-table/xColumn.vue";
import { useI18n } from "../../../composables/useI18n";
import { useAccess } from "../../../composables/useAccess";
import { useForm, useSubForm } from "../../../composables/useForm";

export default {
  props: {
    name: {
      type: String,
      require: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    access: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  components: { xMarkupTable, xJoinTable, xColumn },
  emits: ['update:modelValue'],
  setup (props, {emit}) {
    const { register, component, hidden } = (useSubForm(props.name) || useForm({}, {
      name: props.name
    }))
    let ii = 0;
    const enums = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    const value = ref(0)
    for (let e in enums.value) {
      if (enums.value[e].default) {
        value.value = e
      }
    }
    onUnmounted(watch(() => value.value, (val) => {
      for (let e in enums.value) {
        enums.value[e].default = enums.value[e].id === val
      }
    }))
    onUnmounted(watch(() => props.multiple, () => {
      value.value = 0
      for (let e in enums.value) {
        enums.value[e].default = false
      }
    }))
    function add () {
      let addItem = {
        id: 'n' + (ii++),
        code: "",
        name: "",
        default: false,
        sort: Object.keys(enums.value).length
      };
      let list = {...enums.value};
      list[addItem.id] = addItem;
      enums.value = list;
    }
    function remove (val) {
      let list = {...enums.value};
      delete list[val];
      enums.value = list;
    }

    return {
      t: useI18n('device.components.table-enums').t,
      allow: useAccess().checkHasScope(props.access),
      register, component, hidden,
      enums, value, add, remove }
  },
  data () {
    return {
      rules: {
        name: [
          v => !!v || 'Название бязательно',
        ],
        code: [
          v => !!v || 'Code бязателен',
        ],
      }
    }
  }
}
</script>

<style scoped>

</style>