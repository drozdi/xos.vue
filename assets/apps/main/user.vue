<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense inline-label outside-arrows align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="groups" :label="t('tab-groups')" />
        <q-tab name="accesses" :label="t('tab-accesses')" />
        <q-tab name="roles" :label="t('tab-roles')" />
      </q-tabs>
    </template>
    <q-page>
      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="general">
          <input v-if="exist" :="hidden('id')" />
          <q-input :="register('login', {
            label: t('props.login'),
            rules: rules.login
          })" />
          <select-ou :="component('ou_id', {
            label: t('props.ou_id'),
          })" />
          <select-user :="component('parent_id', {
            label: t('props.parent_id'),
            filters: filtersTutors
          })" />
          <q-input :="register('alias', {
            label: t('props.alias'),
            rules: rules.alias
          })" />
          <div class="q-gutter-sm">
            <q-checkbox :="register('active', {
              label: t('props.active'),
            })" />
          </div>
          <div class="q-gutter-sm">
            <q-checkbox :="register('loocked', {
              label: t('props.loocked'),
            })" />
          </div>
          <date-time :="register('activeFrom', {
            label: t('props.activeFrom'),
          })" />
          <date-time :="register('active_to', {
            label: t('props.active_to'),
          })" />
          <q-input :="register('email', {
            type: 'email',
            label: t('props.email'),
            rules: rules.email
          })" />
          <q-input :="register('phone', {
            label: t('props.phone'),
            rules: rules.phone
          })" />
          <q-input :="register('second_name', {
            label: t('props.second_name'),
            rules: rules.second_name
          })" />
          <q-input :="register('first_name', {
            label: t('props.first_name'),
            rules: rules.first_name
          })" />
          <q-input :="register('patronymic', {
            label: t('props.patronymic'),
            rules: rules.patronymic
          })" />
          <q-input :="register('gender', {
            label: t('props.gender'),
          })" />
          <q-input :="register('country', {
            label: t('props.country')
          })" />
          <q-input :="register('name', {
            type: 'description',
            label: t('props.description'),
          })" />
        </q-tab-panel>
        <q-tab-panel name="groups">
          <table-group :="component('groups')" />
        </q-tab-panel>
        <q-tab-panel name="accesses">
          <table-claimant :="component('accesses')" />
        </q-tab-panel>
        <q-tab-panel name="roles">
          <div class="q-gutter-sm" v-for="role in mapRoles">
            <q-checkbox :="register('roles', {
              readonly: checkHasScope('!can_role'),
              label: role,
              val: role
            })" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-page>
  </win-form>
</template>

<script>
import { computed, watch, onUnmounted } from 'vue'
import winForm from "../../components/windows/winForm";
import dateTime from "../../components/date-time/xDateTime.vue"

import selectOu from "./components/select-ou"
import selectUser from "./components/select-user"
import tableGroup from "./components/table-group"
import tableClaimant from "./components/table-claimant"

import userRepository from "./repository/user";

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";

import initEvents from './utils/user.events'

export default {
  name: "app-main-user",
  components: {winForm, selectOu, selectUser, tableGroup, tableClaimant, dateTime},
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'main-user',
      accessKey: 'main.user',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, component, hidden, register, exist, canAccess } = useForm({}, {
      name: 'user',
      repository: userRepository,
      rules: {
        login: [
          v => !!v || 'Login is required',
          v => (v && v.length <= 255) || 'Логин должен быть меньше 255 символов',
        ],
        alias: [
          v => !!v || 'Alias is required',
          v => (v && v.length >= 6) || 'Псевдоним должен быть больше 6 симоволов',
        ],
      },
    })
    initEvents($app)
    const tab = $sm.join('tab', 'general')

    const filtersTutors = computed(() => ({'ou.isTutors':true}))

    onUnmounted(watch(() => data.value, () => {
      if (Array.isArray(data.value.accesses)) {
        data.value.accesses = {}
      }
      if (Array.isArray(data.value.groups)) {
        data.value.groups = {}
      }
    }))
    $app.on('saved', ($event) => {emit('saved', $event)});
    return {
      exist, canAccess, component, hidden, register, tab, filtersTutors,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  data: function () {
    return {
      mapRoles: ['ROLE_ROOT', 'ROLE_ADMIN', 'ROLE_USER'],
    }
  }
}
</script>

<style scoped>

</style>