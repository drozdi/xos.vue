<template>
  <select-main-claimant v-if="checkHasScope('can_access')"
                        :label="t('btn.add')"
                        :filters="filters"
                        v-model="joinAccess"
                        ref="select" />
  <x-markup-table wrap-cells :grid="grid">
    <tbody>
      <tr v-for="item in claimants" :key="item.id" class="x-table__item">
        <td class="x-table__item-row">
          <div class="x-table__item-value">
            {{item.name}}
            <input type="hidden" :name="name+'['+item.id+'][claimant_id]'" :value="item.claimant_id">
          </div>
        </td>
        <td class="x-table__item-row">
          <div class="x-table__item-value">
            <q-input
                v-model="item.level" dense square
                :readonly="checkHasScope('!can_access')"
                :name="name+'['+item.id+'][level]'"
                type="number"
                :label="t('props.level')" />
          </div>
        </td>
      </tr>
    </tbody>
  </x-markup-table>
</template>

<script>
import { computed, ref } from "vue";
import { useQuasar } from 'quasar'
import selectMainClaimant from './select-claimant';
import xMarkupTable from '../../../components/markup-table/xMarkupTable'

import { useI18n } from "../../../composables/useI18n";
import { useAccess } from "../../../composables/useAccess";
import { injectSize } from "../../../composables/useSize";
import { useGrid } from "../../../composables/useGrid";

export default {
  components: {
    selectMainClaimant, xMarkupTable
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {},
      require: true
    },
    name: {
      type: String,
      require: true
    },
    filters: {
      type: Object,
      default: () => {}
    },
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const $i18n = useI18n('main.components.table-claimant', true)
    const $access = useAccess()
    const select = ref(null)
    const claimants = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('update:modelValue', value)
      }
    });
    const $q = useQuasar()
    const grid = useGrid(800, {xs: 1, sm: 2})

    let ii = 0;
    const joinAccess = computed({
      get: () => null,
      set: (val) => {
        if (!val) {
          return;
        }
        let notAppend = false;
        let addItem = {
          id: 'n'+(ii++),
          claimant_id: val,
          name: "",
          level: 0
        };
        select.value.items.forEach((item) => {
          if (item.value == val) {
            addItem.name = item.label;
          }
        });
        Object.keys(claimants.value).forEach((key) => {
          notAppend = notAppend || claimants.value[key].claimant_id == val;
        });
        if (notAppend) {
          $q.notify({
            message: $i18n.t('errors.add-claimant', addItem),
            color: 'warning',
            progress: true
          })
        } else {
          let list = {...claimants.value};
          list[addItem.id] = addItem;
          claimants.value = list;
        }
      }
    })

    return {t: $i18n.t, checkHasScope: $access.checkHasScope, joinAccess, claimants, select, grid }
  }
}
</script>

<style scoped>

</style>