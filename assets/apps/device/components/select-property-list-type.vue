<template>
  <q-select
      :options="options"
      fill-input
      use-input
      emit-value
      hide-selected
      map-options>
    <template v-for="slot in parentSlots" #[slot]="args">
      <slot :name="slot" v-bind="args" />
    </template>
  </q-select>
</template>

<script>
import { QSelect } from 'quasar'
import { useI18n } from "../../../composables/useI18n";

export default {
  inheritAttrs: true,
  components: { QSelect },
  setup () {
    const $i18n = useI18n('device.components.list-type', true)
    return {t: $i18n.t }
  },
  data () {
    return {
      options: [{
        label: this.t("S"),
        value: 'S'
      }, {
        label: this.t("C"),
        value: 'C'
      }],
    }
  },
  methods: {
    reset () {
      this.$refs.select.reset()
    }
  },
  computed: {
    parentSlots () {
      return Object.keys(this.$slots)
    },
    select () {
      return this.$refs.select
    }
  }
}
</script>

<style scoped>

</style>