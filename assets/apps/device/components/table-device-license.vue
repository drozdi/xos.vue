<template>
  <x-join-table v-model="licenses" :editable="(data, index) => !(index > 0)" wrap-cells grid-header show-title :grid="grid">
    <template #default="{isGrid}">
    <x-column field="type" :header="t('type')">
      <template #body="{data, index, header, field}">
        {{ data.type_name }}
      </template>
      <template #editor="{data, index, header, field}">
        <select-software-type :name="name+'['+index+'][type]'" v-model="data.type" dense square />
      </template>
    </x-column>
    <x-column field="software" :header="t('software')">
      <template #body="{data, index, header, field}">
        {{ data.software_name }}
      </template>
      <template #editor="{data, index, header, field}">
        <select-software v-memo="[data.type, data.software]" :name="name+'['+index+'][software]'" :filters="{type: data.type}" v-model="data.software" dense square />
      </template>
    </x-column>
    <x-column field="licenseType" :header="t('license')">
      <template #body="{data, index, header, field}">
        {{ data.licenseSoftware_name }}
      </template>
      <template #editor="{data, index, header, field}">
        <template v-if="data.licenseType">
          <input type="hidden" :name="name+'['+index+'][licenseType]'" :value="data.licenseType" />
          {{data.licenseType}}
        </template>
        <template v-else>
          <select-license-software v-memo="[data.type, data.software, data.licenseSoftware]"
                                   :name="name+'['+index+'][licenseSoftware]'"
                                   :filters="{software: data.software}" v-model="data.licenseSoftware" dense square />
        </template>
      </template>
    </x-column>
    <x-column field="key" :header="t('key')">
      <template #body="{data, index, header, field}">
        {{ data.key_name }}
      </template>
      <template #editor="{data, index, header, field}">
        <template v-if="data.licenseType">
          <q-input :name="name+'['+index+'][key]'" v-model="data.key" dense square />
        </template>
        <template v-else>
          <select-license-key v-memo="[data.type, data.software, data.licenseSoftware, data.key]"
                              :name="name+'['+index+'][key]'" :filters="{software: data.software, licenseSoftware: data.licenseSoftware}" v-model="data.key" dense square />
        </template>
      </template>
    </x-column>
    <x-column field="id" header="44" :align="isGrid? 'right': 'center'">
      <template #header=>
        <q-btn :title="t('btn.add')" size="xs" icon="mdi-plus" color="info">
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="add">
                <q-item-section>
                  <q-item-label>{{t('btn.add')}}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="add('OEM')">
                <q-item-section>
                  <q-item-label>OEM</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="add('RTL')">
                <q-item-section>
                  <q-item-label>RTL</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
      <template #body="{data, index, header, field}">
        <q-btn text-color="warning" icon="mdi-delete" :title="t('btn.remove')" @click="remove(index)" />
      </template>
      <template #editor="{data, index, header, field}">
        <q-btn text-color="warning" icon="mdi-delete" :title="t('btn.remove')" @click="remove(index)" />
      </template>
    </x-column>
    </template>
  </x-join-table>
</template>

<script>
import { computed } from "vue";
import xMarkupTable from "../../../components/markup-table/xMarkupTable";
import xJoinTable from "../../../components/join-table/xJoinTable";
import xColumn from "../../../components/join-table/xColumn";
import { useI18n } from "../../../composables/useI18n";
import { useAccess } from "../../../composables/useAccess";
import { useGrid } from "../../../composables/useGrid";

import { isString } from "../../../utils/is";

import selectSoftwareType from './select-software-type'
import selectSoftware from './select-software'
import selectLicenseSoftware from './select-license-software'
import selectLicenseKey from "./select-license-key";

let ii = 0;

export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const $i18n = useI18n("device.components.table-device-license")
    const $access = useAccess()
    const grid = useGrid(1100, { xs: 1, sm: 2, md: 3})
    const licenses = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('update:modelValue', value)
      }
    })
    function remove (index) {
      let list = {...licenses.value};
      delete list[index];
      licenses.value = list;
    }
    function add (type = '') {
      let addItem = {
        id: 'n'+(ii++),
        type: null,
        software: null,
        licenseSoftware: null,
        licenseType: isString(type)? type: null,
        key: null
      };
      let list = {...licenses.value};
      list[addItem.id] = addItem;
      licenses.value = list;
    }

    return { t: $i18n.t, checkHasScope: $access.checkHasScope, licenses, remove, add, grid }
  },
  components: {
    xColumn,
    xJoinTable, selectLicenseKey, selectLicenseSoftware, selectSoftware, selectSoftwareType, xMarkupTable }
}
</script>

<style scoped>

</style>