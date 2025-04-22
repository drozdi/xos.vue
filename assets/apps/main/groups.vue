<template>
  <win-table draggable resizable is-left
            :headers="headers"
            :filters="filters"
            :groups="groups"
            source="/main/group/list"
            remove="/main/group/:id">
    <template #left>
      <q-list>
        <q-item clickable :active="filters.ou === -1" @click="changeOu(-1)">
          <q-item-section>{{ t('btn.all') }}</q-item-section>
        </q-item>
        <q-item v-for="item in listOUs" clickable :active="filters.ou === item.id" @click="changeOu(item.id)">
          <q-item-section>{{ item.name }}</q-item-section>
        </q-item>
        <q-item clickable :active="filters.ou === null" @click="changeOu(null)">
          <q-item-section>{{ t('btn.other') }}</q-item-section>
        </q-item>
      </q-list>
    </template>
  </win-table>
</template>

<script>
import { ref, onMounted } from 'vue'
import winTable from "../../components/windows/winTable";

import groupRepository from "./repository/group";

import { useApp} from "../../composables/useApp";
import { useSize } from "../../composables/useSize";
import { useSetting } from "../../composables/useSetting";
import { useI18n } from "../../composables/useI18n";
import { useAccess } from "../../composables/useAccess";
import { useTable } from "../../composables/useTable";

import initEvents from './utils/group.events'

export default {
  name: "app-main-groups",
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting(props.smKey)
    const $i18n = useI18n(props.i18nKey || 'main-ou')
    const $access = useAccess(props.accessKey || 'main.ou')
    const { repository } = useTable(groupRepository)
    initEvents($app)
    const listOUs = ref([])
    const filters = $sm.join('filters', {
      ou: -1
    }, props)
    function loadFilter () {
      repository.filter().then(({data}) => {
        listOUs.value = data;
      });
    }
    function changeOu (val) {
      filters.value.ou = val
    }

    $app.on('reload', loadFilter)

    onMounted(() => {
      $app.reload()
    })

    return {
      listOUs, filters,
      t: $i18n.t,
      checkHasScope: $access.checkHasScope,
      changeOu,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  components: { winTable },
  data: () => ({
    headers: "code name tutor sort",
    groups: []
  })
}
</script>

<style scoped>

</style>