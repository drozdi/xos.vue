<template>
  <win-form draggable resizable is-header :id="id">
    <template #menu>
      <q-tabs dense inline-label outside-arrows align="justify" v-model="tab">
        <q-tab name="general" :label="t('tab-general')" />
        <q-tab name="users" :label="t('tab-users')" />
        <q-tab name="accesses" :label="t('tab-accesses')" />
      </q-tabs>
    </template>
    <template #default>
      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="general" eager>
          <input v-if="exist" :="hidden('id')" />
          <q-input :="register('name', {
            label: t('props.name'),
            rules: rules.name
          })" />
          <q-input :="register('code', {
            label: t('props.code'),
            rules: rules.code
          })" />
          <select-ou :="component('ou_id', {
            label: t('props.ou_id'),
          })" />
          <select-group :="component('parent_id', {
            label: t('props.parent_id'),
            filters: filtersParent
          })" />
          <select-user :="component('user_id', {
            label: t('props.user_id'),
            filters: filtersTutors
          })" />
          <q-input :="register('sort', {
            type: 'number',
            label: t('props.sort'),
          })" />
          <div class="q-gutter-sm">
            <q-checkbox :="register('active', {
              label: t('props.active')
            })" />
          </div>
          <div class="q-gutter-sm">
            <q-checkbox :="register('anonymous', {
              label: t('props.anonymous')
            })" />
          </div>
          <date-time :="register('active_from', {
              label: t('props.active_from')
            })" />
          <date-time :="register('active_to', {
              label: t('props.active_to')
            })" />
          <q-input :="register('description', {
            type: 'textarea',
            label: t('props.description')
          })" />
        </q-tab-panel>
        <q-tab-panel name="users" eager>
          <table-user :="component('users')" />
        </q-tab-panel>
        <q-tab-panel name="accesses" eager>
          <table-claimant :="component('accesses')" />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </win-form>
</template>

<script>
import { computed, watch, onUnmounted } from 'vue'

import winForm from "../../components/windows/winForm";
import dateTime from "../../components/date-time/xDateTime.vue"

import selectOu from "./components/select-ou"
import selectUser from "./components/select-user"
import selectGroup from "./components/select-group"
import tableUser from "./components/table-user"
import tableClaimant from "./components/table-claimant"

import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";

import initEvents from './utils/group.events'
import groupRepository from "./repository/group";

export default {
  name: "app-main-group",
  components: { winForm, dateTime, selectOu, selectUser, selectGroup, tableUser, tableClaimant },
  props: ['id', 'smKey', 'i18nKey', 'accessKey'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'main-group',
      accessKey: 'main.group',
      ...props
    })
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, register, component, hidden, exist, canAccess } = useForm({}, {
      name: 'group',
      repository: groupRepository,
      rules: {
        code: [
          v => !!v || 'Code is required',
          v => (v && v.length <= 255) || 'Code must be less than 255 characters',
        ],
        name: [
          v => !!v || 'Name is required',
        ],
      }
    })
    initEvents($app)

    const tab = $sm.join('tab', 'general', props)

    const filtersParent = computed(() => {
      let ret = {}
      if (data.value.ou_id) {
        ret['ou.id'] = data.value.ou_id
      }
      if (data.value.id) {
        ret['id!'] = data.value.id
      }
      return ret
    })
    const filtersTutors = computed(() => {return {'ou.isTutors':true}})

    onUnmounted(watch(() => data.value, () => {
      if (Array.isArray(data.value.accesses)) {
        data.value.accesses = {}
      }
      if (Array.isArray(data.value.users)) {
        data.value.users = {}
      }
    }))

    $app.on('saved', ($event) => {emit('saved', $event)});

    return {
      component, hidden, register, exist, canAccess,
      tab, filtersTutors, filtersParent,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  }
}
</script>

<style scoped>

</style>