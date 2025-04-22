<template>
  <win-table draggable resizable is-left
             :headers="headers"
             :filters="filters"
             :groups="groups"
             source="/main/user/list"
             remove="/main/user/:id">
    <template #left>
      <q-list>
        <q-item clickable :active="filters.ou === -1" @click="changeOu(-1)">
          <q-item-section>{{ t('btn.all') }}</q-item-section>
        </q-item>
        <q-item v-for="item in listOUs" clickable :active="filters.ou === item.value" @click="changeOu(item.value)">
          <q-item-section>{{ item.title }}</q-item-section>
          <q-menu v-if="item.groups" anchor="top right" self="top left">
            <q-list>
              <template v-for="sub in item.groups">
                <template v-if="sub.type === 'divider'">
                  <q-separator spaced  />
                </template>
                <template v-else-if="sub.type === 'subheader'">
                  <q-item-label header class="text-right">{{ sub.title }}</q-item-label>
                </template>
                <template v-else>
                  <q-item clickable :active="filters.group === sub.value" @click="changeGroup(sub.value)" v-close-popup>
                    <q-item-section>{{ sub.title }}</q-item-section>
                  </q-item>
                </template>
              </template>
            </q-list>
          </q-menu>
        </q-item>
        <q-item clickable :active="filters.ou === null" @click="changeOu(null)">
          <q-item-section>{{ t('btn.other') }}</q-item-section>
        </q-item>
      </q-list>
    </template>
  </win-table>
</template>

<script>
import {onMounted, ref} from "vue";
import winTable from "../../components/windows/winTable"

import userRepository from "./repository/user"

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useTable} from "../../composables/useTable";

import initEvents from './utils/user.events'

export default {
  name: "app-main-users",
  components: { winTable },
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting(props.smKey)
    const $i18n = useI18n(props.i18nKey || 'main-user')
    const $access = useAccess(props.accessKey || 'main.user')
    const { repository } = useTable(userRepository)

    initEvents($app)

    const listOUs = ref([])
    const filters = $sm.join('filters', {
      ou: -1,
      group: -1
    }, props)

    function loadFilter () {
      repository.filter().then(({data}) => {
        listOUs.value = data;
      });
    }
    function changeOu (val) {
      filters.value.ou = val
      filters.value.group = -1
    }
    function changeGroup (val) {
      filters.value.ou = -1
      filters.value.group = val
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
      changeGroup,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data: () => ({
    headers: "login alias tutor",
    groups: [],
  })
}
</script>

<style scoped>

</style>