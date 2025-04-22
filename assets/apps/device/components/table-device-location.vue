<template>
  <x-join-table v-model="locations" :editable="(data, index) => checkHasScope('can_location') && !(index > 0)" wrap-cells grid-header show-title :grid="grid">
    <template #default>
      <x-column field="date" :header="t('date')">
        <template #editor="{data, index, field, header}">
          <q-input
              :name="name+'['+index+'][date]'"
              v-model="data.date"
              :label="header"
              mask="##-##-####" dense square>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="data.date" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </template>
      </x-column>
      <x-column field="responsible" :header="t('responsible')">
        <template #editor="{data, index, field, header}">
          <q-input
              :name="name+'['+index+'][responsible]'"
              v-model="data.responsible"
              :label="header" dense square />
        </template>
      </x-column>
      <x-column field="place" :header="t('place')">
        <template #editor="{data, index, field, header}">
          <q-input
              type="textarea"
              :name="name+'['+index+'][place]'"
              v-model="data.place" rows="2"
              :label="header" dense square />
        </template>
        <x-column :header="t('place')"></x-column>
        <x-column v-if="checkHasScope('can_location')">
          <template #header>
            <q-btn :title="t('btn.add')" color="info" size="xs" icon="mdi-plus" @click="add" />
          </template>
        </x-column>
      </x-column>
    </template>
  </x-join-table>
</template>

<script>
import { computed } from 'vue'
import { date } from 'quasar'
import xMarkupTable from "../../../components/markup-table/xMarkupTable";
import xJoinTable from "../../../components/join-table/xJoinTable";
import xColumn from "../../../components/join-table/xColumn";
import { useI18n } from "../../../composables/useI18n";
import { useAccess } from "../../../composables/useAccess";
import { useGrid } from "../../../composables/useGrid";

let ii = 0;
export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      require: true
    }
  },
  emits: ['update:modelValue'],
  components: { xMarkupTable, xJoinTable, xColumn },
  setup (props, { emit }) {
    const locations = computed({
      get () {
        return props.modelValue
      },
      set (list) {
        emit('update:modelValue', list)
      }
    })
    function add () {
      let addItem = {
        id: 'n'+(ii++),
        date: date.formatDate(Date.now(), 'DD-MM-YYYY'),
        responsible: "",
        place: ""
      };
      let list = {...locations.value};
      list[addItem.id] = addItem;
      locations.value = list;
    }
    function remove (index) {
      let list = {...locations.value};
      delete list[index];
      locations.value = list;
    }

    return {
      locations, add, remove,
      grid: useGrid(800, { xs: 1, sm: 2}),
      t: useI18n('device.components.table-device-location').t,
      checkHasScope: useAccess().checkHasScope,
    }
  }
}
</script>

<style scoped>

</style>