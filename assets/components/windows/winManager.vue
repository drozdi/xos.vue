<template>
  <q-tabs v-model="current" no-caps inline-label>
    <template v-for="win in stack">
      <template v-if="sub(win).length > 1">
        <q-btn-dropdown auto-close stretch flat :label="win.title">
          <q-tab v-for="sub in sub(win)" :name="sub.$.uid" :label="sub.title" @click="sub.onFocus" />
        </q-btn-dropdown>
      </template>
      <template v-else>
        <q-tab :name="win.$.uid" :label="win.title" @click="win.onFocus" />
      </template>
    </template>
  </q-tabs>
</template>

<script>
import { QTabs, QTab, QBtnDropdown } from "quasar";
import wm from '../../apps/wm';
export default {
  name: "win-manager",
  components: { QTabs, QTab, QBtnDropdown },
  data () {
    return {
      current: wm.current,
      stack: wm.stack
    };
  },
  methods: {
    sub (window) {
      return wm.getStack(window.wmGroup)
    }
  }
}
</script>
<style lang="scss">
  .x-tab .q-tab__content {
    justify-content: left !important;
  }
</style>