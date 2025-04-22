<template>
  <x-markup-table wrap-cells grid-header show-title :grid="grid">
    <template #header>
      <thead>
        <tr>
          <th>{{t('putInto')}}</th>
          <th>{{t('receivedFrom')}}</th>
          <th>{{t('repairman')}}</th>
          <th>{{t('reason')}}</th>
          <th>{{t('description')}}</th>
          <th><q-btn :title="t('btn.add')" v-if="checkHasScope('can_repair')" size="xs" color="info" icon="mdi-plus" @click="add" /></th>
        </tr>
      </thead>
    </template>
    <thead>
      <tr>
        <th>{{t('putInto')}}</th>
        <th>{{t('receivedFrom')}}</th>
        <th>{{t('repairman')}}</th>
        <th>{{t('reason')}}</th>
        <th>{{t('description')}}</th>
        <th><q-btn :title="t('btn.add')" v-if="checkHasScope('can_repair')" size="xs" color="info" icon="mdi-plus" @click="add" /></th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, index) in repairs">
        <tr v-if="index > 0 && item.closed" class="x-table__item">
          <td class="x-table__item-row">
            <div class="x-table__item-title">{{t('putInto')}}</div>
            <div class="x-table__item-value">{{item.putInto}}</div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-title">{{t('receivedFrom')}}</div>
            <div class="x-table__item-value">{{item.receivedFrom}}</div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-title">{{t('repairman')}}</div>
            <div class="x-table__item-value">{{item.repairman}}</div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-title">{{t('reason')}}</div>
            <div class="x-table__item-value">{{item.reason}}</div>
          </td>
          <td class="x-table__item-row" colspan="2">
            <div class="x-table__item-title">{{t('description')}}</div>
            <div class="x-table__item-value">{{item.description}}</div>
          </td>
        </tr>
        <tr v-else-if="index > 0" class="x-table__item">
          <td class="x-table__item-row">
            <div class="x-table__item-title">{{t('putInto')}}</div>
            <div class="x-table__item-value">{{item.putInto}}</div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                :name="name+'['+index+'][receivedFrom]'"
                v-model="item.receivedFrom"
                :label="t('receivedFrom')"
                mask="##-##-####" dense square>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="item.receivedFrom" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                :name="name+'['+index+'][repairman]'"
                v-model="item.repairman"
                :label="t('repairman')" dense square />
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                type="textarea"
                :name="name+'['+index+'][reason]'"
                v-model="item.reason" rows="3"
                :label="t('reason')" dense square />
            </div>
          </td>
          <td class="x-table__item-row" colspan="2">
            <div class="x-table__item-value">
            <q-input
                type="textarea"
                :name="name+'['+index+'][description]'"
                v-model="item.description" rows="3"
                :label="t('description')" dense square />
            </div>
          </td>
        </tr>
        <tr v-else class="x-table__item">
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                :name="name+'['+index+'][putInto]'"
                v-model="item.putInto"
                :label="t('putInto')"
                mask="##-##-####" dense square>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="item.putInto" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                :name="name+'['+index+'][receivedFrom]'"
                v-model="item.receivedFrom"
                :label="t('receivedFrom')"
                mask="##-##-####" dense square>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="item.receivedFrom" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                :name="name+'['+index+'][repairman]'"
                v-model="item.repairman"
                :label="t('repairman')" dense square />
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                type="textarea"
                :name="name+'['+index+'][reason]'"
                v-model="item.reason" rows="3"
                :label="t('reason')" dense square />
            </div>
          </td>
          <td class="x-table__item-row">
            <div class="x-table__item-value">
            <q-input
                type="textarea"
                :name="name+'['+index+'][description]'"
                v-model="item.description" rows="3"
                :label="t('description')" dense square />
            </div>
          </td>
          <td class="x-table__item-row text-right">
            <div class="x-table__item-value">
            <q-btn v-if="checkHasScope('can_repair')" text-color="warning" :title="t('btn.remove')" icon="mdi-delete" @click="remove(index)" />
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </x-markup-table>
</template>

<script>
import { computed } from "vue";
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
  components: { xMarkupTable },
  setup (props, { emit }) {
    const $i18n = useI18n('device.components.table-device-repair')
    const $access = useAccess()
    const grid = useGrid(800, { xs: 1, sm: 2})
    const repairs = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('update:modelValue', value)
      }
    })
    function add () {
      let addItem = {
        id: 'n'+(ii++),
        putInto: date.formatDate(Date.now(), 'DD-MM-YYYY'),
        receivedFrom: "",
        repairman: "",
        reason: "",
        description: ""
      };
      let list = {...repairs.value};
      list[addItem.id] = addItem;
      repairs.value = list;
    }
    function remove (index) {
      let list = {...repairs.value};
      delete list[index];
      repairs.value = list;
    }

    return {t: $i18n.t, checkHasScope: $access.checkHasScope, repairs, add, remove, grid }
  }
}
</script>

<style scoped>

</style>