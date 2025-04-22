<template>
  <select-main-user
      v-if="checkHasScope('can_user')"
      :label="t('btn.add')"
      :filters="filters" v-model="joinUser" ref="select" />
  <x-markup-table wrap-cells :grid="grid">
    <tbody>
    <tr v-for="(item, index) in users" :key="index" class="x-table__item">
      <td class="x-table__item-row">
        <div class="x-table__item-value">
          {{item.name}}
          <input type="hidden" :name="name+'['+index+'][user_id]'" :value="item.user_id">
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
      <td v-if="checkHasScope('can_user')" class="x-table__item-row text-right">
        <div class="x-table__item-value">
          <q-btn text-color="warning" square :title="t('btn.remove')" @click="remove(index)" icon="mdi-delete" />
        </div>
      </td>
    </tr>
    </tbody>
  </x-markup-table>
</template>

<script>
import { computed, ref } from "vue"
import { useQuasar } from 'quasar'
import SelectMainUser from './select-user';
import dateTime from "../../../components/date-time/xDateTime.vue"
import xMarkupTable from '../../../components/markup-table/xMarkupTable'

import {useI18n} from "../../../composables/useI18n";
import {useAccess} from "../../../composables/useAccess";
import {injectSize} from "../../../composables/useSize";
import { useGrid } from "../../../composables/useGrid";


export default {
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
    const $i18n = useI18n('main.components.table-users', true)
    const $access = useAccess()
    const $q = useQuasar()
    const select = ref(null)
    const users = computed({
      get () {
        return props.modelValue
      },
      set (list) {
        emit('update:modelValue', list)
      }
    })

    const grid = useGrid(800, {xs: 1, sm: 2})
    let ii = 0;
    const joinUser = computed({
      get: () => null,
      set: (val) => {
        let notAppend = false;
        let addItem = {
          id: 'n'+(ii++),
          user_id: val,
          name: "",
          activeFrom: null,
          activeTo: null,
        };
        select.value.items.forEach(function (item) {
          if (item.value == val) {
            addItem.name = item.label;
          }
        });
        Object.keys(users.value).forEach((key) => {
          notAppend = notAppend || users.value[key].user_id == val
        })
        if (notAppend) {
          $q.notify({
            message: $i18n.t('errors.add-user', addItem),
            color: 'warning',
            progress: true
          })
        } else {
          let list = {...users.value}
          list[addItem.id] = addItem;
          users.value = list
        }
        select.value?.reset()
      }
    })
    function remove (val) {
      let list = {...users.value}
      delete list[val]
      users.value = list
    }

    return {t: $i18n.t, checkHasScope: $access.checkHasScope, select, joinUser, users, grid, remove }
  },
  components: {
    SelectMainUser, dateTime, xMarkupTable
  }
}
</script>

<style scoped>

</style>