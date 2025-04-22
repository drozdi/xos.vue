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
  name: "select-field-type",
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
        label: this.t("L"),
        value: 'L'
      }, {
        label: this.t("N"),
        value: 'N'
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
        "select-field-type": {
          "S": "Строка",
          "L": "Список",
          "N": "Число"
        },
      }
    }
  }
}
</script>

<style scoped>

</style>