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
export default {
  inheritAttrs: true,
  components: { QSelect },
  data () {
    return {
      options: ['RTL', 'OEM', 'VLS', 'FREE'],
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