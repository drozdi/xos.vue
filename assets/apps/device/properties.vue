<template>
  <win-table draggable resizable
           :headers="headers"
           :filters="filters"
           :groups="groups"
           source="/device/properties/list"
           remove="/device/properties/:id">
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
import initEvents from "./utils/property.events";
import propertiesRepository from "./repository/properties";


export default {
  name: "app-device-properties",
  components: { winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { repository } = useTable(propertiesRepository)
    initEvents($app)

    return {
      repository,
      t: $i18n.t,
      checkHasScope: $access.checkHasScope,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data: function () {
    return {
      headers: "name code sort",
      filters: {
        parent: null,
        type: null
      },
      groups: []
    }
  }
}
</script>

<style lang="scss">

</style>