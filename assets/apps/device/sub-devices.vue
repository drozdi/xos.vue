<template>
  <win-table draggable resizable is-left
           :headers="headers"
           :groups="groups"
           :filters="filters"
           source="/device/subDevices/list"
           remove="/device/subDevices/:id">
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
import subDevicesRepository from "./repository/sub-devices";
import initEvents from "./utils/sub.device.events";


export default {
  name: "app-device-sub-devices",
  components: { winTable, xSideFilter },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp({
      i18nKey: 'device-sub-device',
      accessKey: 'device.subDevice',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { repository } = useTable(subDevicesRepository)
    initEvents($app)

    const filters = $sm.join('filters', {
      type: null
    }, props)

    const types = ref({})
    function loadFilter () {
      repository.filter().then(({data}) => {
        types.value = data
      })
    }

    //onMounted(() => {
      loadFilter()
    //})

    return {
      types, filters, t: $i18n.t
    }
  },
  data: function () {
    return {
      headers: "name location sn dateCreated xTimestamp",
      groups: []
    }
  }
}
</script>

<style lang="scss">

</style>