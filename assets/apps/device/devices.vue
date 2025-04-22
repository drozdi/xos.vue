<template>
  <win-table draggable resizable is-left
           :headers="headers"
           :groups="groups"
           :filters="filters"
           source="/device/devices/list"
           remove="/device/devices/:id">
    <template #left>
      <x-side-filter :options="types" v-model="filters.type" dense clickable />
    </template>
  </win-table>
</template>

<script>
import { ref, onMounted } from "vue";

import winTable from "../../components/windows/winTable";
import xSideFilter from "../../components/side-filter/xSideFilter.vue";

import axios from '../../plugins/axios'

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useTable} from "../../composables/useTable";
import devicesRepository from "./repository/devices";
import initEvents from "./utils/device.events";


export default {
  name: "app-device-devices",
  components: { winTable, xSideFilter },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp({
      i18nKey: 'device-device',
      accessKey: 'device.device',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { repository } = useTable(devicesRepository)
    initEvents($app)

    const filters = $sm.join('filters', {
      type: null
    }, props)

    const types = ref({})
    function loadFilter () {
      devicesRepository.filter().then(({data}) => {
        types.value = data
        if (filters.value.type > 0) {
          return
        }
        for (let i = 0, cnt = data.length || 0; i < cnt; i++) {
          if (data[i].type === "subheader" || data[i].type === "divider" ) {
            continue
          }
          if (data[i].value > 0) {
            filters.value.type = data[i].value
            break;
          }
        }
      })
    }
    function changeType (value) {
      filters.value.type = value
    }

    onMounted(() => {
      loadFilter()
    })

    return {
      repository,
      types, filters, changeType,
      t: $i18n.t,
      checkHasScope: $access.checkHasScope,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data: function () {
    return {
      headers: "code location inNo dateCreated xTimestamp",
      groups: []
    }
  }
}
</script>

<style lang="scss">

</style>