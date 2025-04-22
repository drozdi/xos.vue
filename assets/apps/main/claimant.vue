<template>
  <win-form draggable resizable overflow :id="id" :w="375" :h="500">
    <div class="q-pa-sm">
      <input v-if="exist" :="hidden('id')" >
      <q-input :="register('name', {
        label: t('props.name')
      })" />
      <q-input :="register('code', {
        label: t('props.code')
      })" />
    </div>
  </win-form>
</template>

<script>
import winForm from "../../components/windows/winForm";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";

import claimantRepository from "./repository/claimant";
import initEvents from "./utils/claimant.events";

export default {
  name: "app-main-claimant",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["save"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'main-claimant',
      accessKey: 'main.claimant',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()

    const { register, hidden, exist } = useForm({}, {
      name: 'claimant',
      repository: claimantRepository,
      rules: {
        code: [
          v => !!v || 'Code бязателен',
        ],
        name: [
          v => !!v || 'Название бязательно',
        ],
      }
    })

    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});

    return {
      exist, register, hidden,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  components: { winForm }
}
</script>

<style scoped>

</style>