<template>
  <win-table draggable resizable
             :headers="headers"
             :filters="filters"
             :groups="groups"
             source="/main/claimant/list"
             remove="/main/claimant/:id"/>
</template>

<script>
import winTable from "../../components/windows/winTable";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useTable} from "../../composables/useTable";

import claimantRepository from "./repository/claimant";
import { appsManager } from "../core";
import appMainClaimant from "./claimant";
import initEvents from "./utils/claimant.events";

export default {
  components: { winTable },
  name: "app-main-claimants",
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting(props.smKey)
    const $i18n = useI18n(props.i18nKey || 'main-claimant')
    const $access = useAccess(props.accessKey || 'main.claimant')
    const $table = useTable(claimantRepository)
    initEvents($app)
    return {
      t: $i18n.t,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data: () => ({
    headers: 'name code',
    filters:  {},
    groups: []
  })
}
</script>

<style lang="scss">

</style>