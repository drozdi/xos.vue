<template>
  <win-table draggable resizable
           :headers="headers"
           :filters="filters"
           :groups="groups"
           source="/device/software/type/list"
           remove="/device/software/type/:id">
  </win-table>
</template>

<script>
import winTable from "../../../components/windows/winTable";

import {useApp} from "../../../composables/useApp";
import {useSize} from "../../../composables/useSize";
import {useSetting} from "../../../composables/useSetting";
import {useI18n} from "../../../composables/useI18n";
import {useAccess} from "../../../composables/useAccess";
import {useTable} from "../../../composables/useTable";
import softwareTypeRepository from "../repository/softwareType";
import initEvents from "../utils/software.type.events";

export default {
  name: "app-device-software-types",
  components: { winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp({
      i18nKey: 'device-software-type',
      accessKey: 'device.software.type',
      ...props
    })
    const $size = useSize()
    useTable(softwareTypeRepository)
    initEvents($app)

    return {
      t: useI18n().t,
      checkHasScope: useAccess().checkHasScope,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data () {
    return {
      headers: "code name sort",
      filters: {},
      groups: []
    }
  }
}
</script>

<style lang="scss">

</style>