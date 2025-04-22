<template>
  <win-table draggable resizable
           :headers="headers"
           :groups="groups"
           :filters="filters"
           source="/device/types/list"
           remove="/device/types/:id">
    <template #item-actions="{ row, isChildren, addItem, viewItem, editItem, removeItem }">
        <q-item-label v-if="isChildren">
          <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="changeKey(props.row)" :title="t('btn.view')" />
          <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="changeKey(row)" :title="t('btn.edit')" />
        </q-item-label>
        <q-item-label v-else>
          <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="viewItem(row)" :title="t('btn.view')" />
          <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="editItem(row)" :title="t('btn.edit')" />
          <q-btn v-if="checkHasScope('can_delete')" icon="mdi-delete" @click="removeItem(row)" :title="t('btn.remove')" />
        </q-item-label>
    </template>
    <template #body-cell-actions="props">
      <q-td key="actions" :props="props">
        <template v-if="props.isChildren">
          <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="changeKey(props.row)" :title="t('btn.view')" />
          <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="changeKey(props.row)" :title="t('btn.edit')" />
        </template>
        <template v-else>
          <q-btn v-if="checkHasScope('can_read !can_update')" icon="mdi-eye-outline" @click="props.viewItem(props.row)" :title="t('btn.view')" />
          <q-btn v-if="checkHasScope('can_update')" icon="mdi-pencil" @click="props.editItem(props.row)" :title="t('btn.edit')" />
          <q-btn v-if="checkHasScope('can_delete')" icon="mdi-delete" @click="props.removeItem(props.row)" :title="t('btn.remove')" />
        </template>
      </q-td>
    </template>
  </win-table>
</template>

<script>
import { appsManager } from "../core";
import winTable from "../../components/windows/winTable";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useTable} from "../../composables/useTable";
import licensesRepository from "./repository/license";
import initEvents from "./utils/license.events";
import appLicenseKey from './license-key'

export default {
  name: "app-device-licenses",
  components: { winTable },
  props: ['smKey', 'i18nKey', 'accessKey'],
  setup (props) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting(props.smKey)
    const $i18n = useI18n(props.i18nKey || 'device-license')
    const $access = useAccess(props.accessKey || 'device.license')
    const { repository } = useTable(licensesRepository)
    initEvents($app)

    function changeKey (item) {
      appsManager.createApp(appLicenseKey, {
        id: item.id
      })
    }

    return {
      changeKey,
      t: $i18n.t,
      checkHasScope: $access.checkHasScope,
      reload ($event) {
        $app.reload($event)
      }
    }
  },
  data: function () {
    return {
      headers: "code type",
      groups: "license_id",
      filters: {
        'type!': 'OEM'
      },
    }
  }
}
</script>

<style lang="scss">

</style>