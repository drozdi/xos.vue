<template>
  <x-layout class="x-desktop x-layout--core" is-footer ref="layout" sm-key="desktop">
    <template #footer>
      <div class="float-left">
        <start-menu />
      </div>
      <div class="float-left">
        <win-manager />
      </div>
    </template>
  </x-layout>
  <teleport to="body">
    <x-window title="Ошибка" v-if="alert.message" :h="500" :w="500" draggable
              :icons="['fullscreen']"
              :actions="[{'title': 'Закрыть', 'icon': 'mdi-close','color':'red','onClick':() => {$store.dispatch('alert/clear');}}]">
      <iframe :srcdoc="alert.message" width="100%" height="100%" />
    </x-window>
  </teleport>
  <!--<div class="fit scroll">
    <x-join-table editable v-model="items" separate>
      <template #default="{isGrid}">
        <x-column field="group_id" :header="t('group_id')" />
        <x-column field="id" :header="t('id')" sortable />
        <x-column field="name" :header="t('name')" sortable />
        <x-column field="type" :header="t('type')" />
        <x-column field="sort" :header="t('sort')" sortable />
        <x-column field="nodes" :header="t('nodes')" is-group is-grouped />
      </template>
  </x-join-table>
  <pre>
    {{ items }}
  </pre>
  </div>-->
</template>
<script>
import { defineComponent, reactive, ref, provide, getCurrentInstance } from 'vue'
import { useQuasar } from "quasar";

import xOS from "./apps/core";
import "./apps/main/core";
import "./apps/device/core";

import StartMenu from "./components/startMenu";
import WinManager from "./components/windows/winManager";

import { mapState, mapGetters } from 'vuex';

import drRe from './components/dr-re/dr-re';
import xWindow from "./components/window/xWindow";
import xLayout from './components/layout/xLayout';
import xTable from "./components/table/xTable";
import xRow from "./components/row/xRow";

import xMarkupTable from "./components/markup-table/xMarkupTable.vue";
import xJoinTable from "./components/join-table/xJoinTable.vue";
import xColumn from "./components/join-table/xColumn.vue";
import propertyInput from "./apps/device/components/property-input.vue"
import formComponentProperties from "./apps/device/components/form-component-properties.vue"
import tableDeviceProperty from "./apps/device/components/table-device-property.vue"

import { useApp } from "./composables/useApp";
import { useSize } from "./composables/useSize";
import { useAccess } from "./composables/useAccess";
import { useSetting } from "./composables/useSetting";
import { useI18n } from "./composables/useI18n";
import { useGrid } from "./composables/useGrid";
import { useForm } from "./composables/useForm";

import xApp from './components/app/xApp'
import AppMainOu from './apps/main/ou'

export default defineComponent(function App (props, { emit }) {
  const $app = useApp({
    smKey: 'desktop',
    i18nKey: 'desktop',
    accessKey: 'desktop',
  })
  const grid = useGrid(1400, {xs:1, sm: 2, md: 3})
  const { data, component } = useForm({
    data: {}
  }, {
    name: 'test'
  })
  return { grid, t: (val) => val, component, data }
}, {
  name: 'App',
  components: {
    xColumn,
    xJoinTable,
    formComponentProperties,
    tableDeviceProperty,
    xRow,
    AppMainOu,
    StartMenu,
    xMarkupTable,
    xApp,
    WinManager,
    xLayout,
    xWindow,
    xTable,
    drRe,
    propertyInput
  },
  data: () => ({
    username: null,
    password: null,
    name: 'ttt',
    items: {}
  }),
  computed: {
    ...mapGetters('authentication', [
      'isAuth',
      'isAdmin',
      'isRoot'
    ]),
    alert () {
      return this.$store.state.alert
    }
  },
  methods: {
    auth () {
      const { username, password } = this;
      const { dispatch } = this.$store;
      dispatch('authentication/login', { username, password });
    }
  },
  mounted () {
    xOS.$sm.WINDOW.config.set('parent', "#parent_win")
    this.$refs.layout?.$refs.body.$el.setAttribute('id', "parent_win")//*/
    const { dispatch } = this.$store;
    dispatch('authentication/check')
  }
})
</script>

<style lang="scss">
@import "scss/index";
@import "styles/quasar.variables";
html, body {
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.x-desktop {
  width: 100%;
  height: 100%;
}
.x-desktop__toolbar {
  position: relative;
  min-height: 100%;
  min-width: 100%;
  @include clearfix;
  background: $dark-page;
}
</style>