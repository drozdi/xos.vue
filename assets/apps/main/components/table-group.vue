<template>
  <select-main-group
      v-if="checkHasScope('can_group')"
      :label="t('btn.add')"
      :filters="filters"
      v-model="joinGroup"
      ref="select" />
  <x-markup-table wrap-cells :grid="grid">
    <tbody>
    <tr v-for="(item, index) in groups" :key="index" class="x-table__item">
      <td class="x-table__item-row">
        <div class="x-table__item-value">
          {{item.name}}
          <input type="hidden" :name="name+'['+index+'][group_id]'" :value="item.group_id">
        </div>
      </td>
      <td class="x-table__item-row">
        <div class="x-table__item-value">
          <date-time
              v-model="item.activeFrom" dense square
              :label="t('props.activeFrom')"
              :name="name+'['+index+'][activeFrom]'" />
        </div>
      </td>
      <td class="x-table__item-row">
        <div class="x-table__item-value">
          <date-time
              v-model="item.activeTo" dense square
              :label="t('props.activeTo')"
              :name="name+'['+index+'][activeTo]'" />
        </div>
      </td>
      <td v-if="checkHasScope('can_group')" class="x-table__item-row text-right">
        <div class="x-table__item-value">
          <q-btn text-color="warning" :title="t('btn.remove')" icon="mdi-delete" @click="remove(index)" />
        </div>
      </td>
    </tr>
    </tbody>
  </x-markup-table>
</template>

<script>
import { computed, ref } from "vue"
import { useQuasar } from 'quasar'
import SelectMainGroup from './select-group';
import dateTime from "../../../components/date-time/xDateTime.vue";
import xMarkupTable from '../../../components/markup-table/xMarkupTable'


import {useI18n} from "../../../composables/useI18n";
import {useAccess} from "../../../composables/useAccess";
import {injectSize} from "../../../composables/useSize";
import {useGrid} from "../../../composables/useGrid";


let ii = 0;
export default {
  components: {
    SelectMainGroup, dateTime, xMarkupTable
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      require: true
    },
    filters: {
      type: Object,
      default: () => ({})
    },
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const $i18n = useI18n('main.components.table-groups', true)
    const $access = useAccess()
    const select = ref(null)
    const groups = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })
    const $q = useQuasar()
    const grid = useGrid(800, {xs: 1, sm: 2})

    const joinGroup = computed({
      get: () => null,
      set: (val) => {
        if (!val) {
          return;
        }
        let notAppend = false;
        let addItem = {
          id: 'n'+(ii++),
          group_id: val,
          name: "",
          activeFrom: null,
          activeTo: null,
        };
        select.value.items.forEach((item) => {
          if (item.value == val) {
            addItem.name = item.label;
          }
        });
        Object.keys(groups.value).forEach((key) => {
          notAppend = notAppend || groups.value[key].group_id == val;
        });
        if (notAppend) {
          $q.notify({
            message: $i18n.t('errors.add-group', addItem),
            color: 'warning',
            progress: true
          })
        } else {
          let list = {...groups.value};
          list[addItem.id] = addItem;
          groups.value = list;
        }
        select.value.reset();
      }
    })

    function remove (val) {
      let list = {...groups.value};
      delete list[val];
      groups.value = list;
    }
    return {t: $i18n.t, checkHasScope: $access.checkHasScope, select, joinGroup, groups, remove, grid }
  }
}
</script>

<style scoped>

</style>