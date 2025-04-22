<template>
  <win-form draggable resizable :id="id">
    <div class="q-pa-sm">
      <input v-if="exist" :="hidden('id')" />
      <q-input :="register('name', {
        label: t('props.name')
      })" />
      <q-input :="register('code', {
        label: t('props.code')
      })" />
      <q-input :="register('sort', {
        type: 'number',
        label: t('props.sort')
      })" />
    </div>
  </win-form>
</template>

<script>
import winForm from "../../../components/windows/winForm";

import {useApp} from "../../../composables/useApp";
import {useSize} from "../../../composables/useSize";
import {useSetting} from "../../../composables/useSetting";
import {useI18n} from "../../../composables/useI18n";
import {useAccess} from "../../../composables/useAccess";
import {useForm} from "../../../composables/useForm";
import initEvents from "../../main/utils/ou.events";

import softwareTypeRepository from "../repository/softwareType";

export default {
  name: "app-device-software-type",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-software-type',
      accessKey: 'device.software.type',
      ...props
    })
    const $i18n = useI18n()
    const $access = useAccess()
    const { exist, register, hidden } = useForm({}, {
      name: 'type',
      repository: softwareTypeRepository,
      rules: {
        name: [
          v => !!v || 'Название бязательно',
        ],
        code: [
          v => !!v || 'Code бязателен',
        ],
      }
    })
    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});
    return {
      hidden, exist, register,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  components: { winForm }
}
</script>

<style scoped>

</style>