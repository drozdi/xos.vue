<template>
  <win-table draggable resizable
             :headers="headers"
             :filters="filters"
             :groups="groups"
             source="/main/ou/list"
             remove="/main/ou/:id" />
</template>

<script>
import winTable from "../../components/windows/winTable";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useTable} from "../../composables/useTable";
import ouRepository from "./repository/ou";
import initEvents from "./utils/ou.events";

export default {
  name: "app-main-ous",
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp({
      i18nKey: 'main-ou',
      accessKey: 'main.ou',
      ...props
    })
    useSize()
    useTable(ouRepository)
    initEvents($app)
    return {
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  components: { winTable },
  data: () => ({
    headers: "code name tutor sort",
    filters: {},
    groups: []
  })
}
</script>

<style lang="scss">

</style>