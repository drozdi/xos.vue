<template>
  <win-table draggable resizable
           :headers="headers"
           :groups="groups"
           :filters="filters"
           source="/device/types/list"
           remove="/device/types/:id">
  </win-table>
</template>

<script>

import winTable from "../../components/windows/winTable";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useTable} from "../../composables/useTable";
import typesRepository from "./repository/types";
import initEvents from "./utils/type.events";

export default {
  name: "app-device-types",
  components: { winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp({
      i18nKey: 'device-type',
      accessKey: 'device.type',
      ...props
    })
    useTable(typesRepository)
    initEvents($app)
    return {
      t: useI18n('device-type').t,
      checkHasScope: useAccess('device.type').checkHasScope
    }
  },
  data: function () {
    return {
      headers: "name code sort",
      groups: "group_id",
      filters: {
        parent: null,
        property: null
      },
    }
  }
}
</script>

<style lang="scss">

</style>