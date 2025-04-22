<template>
  <q-select
      v-bind="$attrs"
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
import {useI18n} from "../../../composables/useI18n";

export default {
  name: "select-list-type",
  setup (props, { emit }) {
    const $i18n = useI18n()
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
  },
  i18n: {
    messages: {
      ru: {
        "select-list-type": {
          "S": "Выподающий список",
          "C": "Переключатель"
        }
      }
    }
  }
}
</script>

<style scoped>

</style>