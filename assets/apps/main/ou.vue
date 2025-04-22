<template>
  <win-form draggable resizable overflow :id="id" :w="375" :h="500">
    <div class="q-pa-sm">
      <input v-if="exist" :="hidden('id')" >
      <q-input :="register('code', {
        label: t('props.code'),
      })" />
      <q-input :="register('name', {
        label: t('props.name'),
      })" />
      <select-user :="component('user_id', {
        label: t('props.user_id'),
        filters: filtersTutors
      })" />
      <q-input :="register('sort', {
        type: 'number',
        label: t('props.sort'),
      })" />
      <q-checkbox :="register('is_tutors', {
        label: t('props.is_tutors')
      })" />
      <q-input :="register('description', {
        type: 'textarea',
        label: t('props.description')
      })" />
    </div>
  </win-form>
</template>

<script>
import { computed } from "vue";
import winForm from "../../components/windows/winForm";
import selectUser from "./components/select-user"

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";

import ouRepository from "./repository/ou";
import initEvents from './utils/ou.events'


export default {
  name: "app-main-ou",
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'main-ou',
      accessKey: 'main.ou',
      ...props
    })
    const $i18n = useI18n()
    const $access = useAccess()
    const { register, component, hidden, exist } = useForm({}, {
      name: 'ou',
      repository: ouRepository,
      rules: {
        code: [
          v => !!v || 'Code бязателен',
        ],
      }
    })
    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});
    const filtersTutors = computed(() => ({'ou.isTutors':true}))
    return {
      register, component, hidden, exist, filtersTutors,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  components: { winForm, selectUser },
}
</script>

<style scoped>

</style>