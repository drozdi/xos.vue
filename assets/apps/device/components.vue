<template>
  <win-table draggable resizable
           :headers="headers"
           :filters="filters"
           :groups="groups"
           source="/device/components/list"
           remove="/device/components/:id">
  </win-table>
</template>

<script>
import winTable from "../../components/windows/winTable"

import { useApp } from '../../composables/useApp'
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import {useTable} from "../../composables/useTable";
import componentsRepository from "./repository/components";
import initEvents from "./utils/component.events";

export default {
  name: "app-device-components",
  components: { winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting(props.smKey)
    const $i18n = useI18n(props.i18nKey || 'device-component')
    const $access = useAccess(props.accessKey || 'device.component')
    const { repository } = useTable(componentsRepository)
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
        'type!': null
      },
      groups: []
    }
  },
  mounted () {},
}
</script>

<style lang="scss">

</style>