<template>
  <win-table draggable resizable is-left
             :headers="headers"
           :filters="filters"
           :groups="groups"
           source="/device/software/list"
           remove="/device/software/:id">
    <template #left>
      <x-side-filter :options="types" v-model="filters.type" dense clickable />
    </template>
  </win-table>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import winTable from "../../components/windows/winTable";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useTable} from "../../composables/useTable";
import {useForm} from "../../composables/useForm";
import softwareRepository from "./repository/software";
import initEvents from "./utils/software.events";
import xSideFilter from "../../components/side-filter/xSideFilter.vue";


export default {
  name: "app-device-softwares",
  components: {xSideFilter, winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $q = useQuasar()
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { repository } = useTable(softwareRepository)
    initEvents($app)

    const filters = $sm.join('filters', {
      parent: null,
      type: -1
    }, props)

    const types = ref([]);

    function loadFilter () {
      if (!$access.checkHasScope('can_read')) {
        $q.notify({
          message: $i18n.t('errors.denied'),
          color: 'warning',
          progress: true
        })
        return
      }
      repository.filter().then(({data}) => {
        types.value = data;
      });
    }
    $app?.on('reload', loadFilter)
    onMounted(() => {
      loadFilter()
    })

    return {
      filters,
      types,
      t: $i18n.t,
      checkHasScope: $access.checkHasScope,
    }
  },
  data: () => ({
    headers: "name type sort",
    groups: "group_id"
  })
}
</script>

<style lang="scss">

</style>