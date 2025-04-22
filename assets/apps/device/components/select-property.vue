<template>
  <select-prototype source="/device/properties/select" :sort="[{
        'key': 'sort',
        'order': 'ASC'
      }, {
        'key': 'name',
        'order': 'ASC'
      }]" ref="p">
    <template v-for="slot in parentSlots" #[slot]="args">
      <slot :name="slot" v-bind="args" />
    </template>
  </select-prototype>
</template>

<script>
import selectPrototype from "../../../components/select-prototype"
export default {
  inheritAttrs: true,
  components: { selectPrototype },
  methods: {
    reset () {
      this.$refs.p.$refs.select.reset()
    }
  },
  computed: {
    parentSlots () {
      return Object.keys(this.$slots)
    },
    items () {
      return this.$refs.p.items
    },
    select () {
      return this.$refs.p.select
    }
  }
}
</script>

<style scoped>

</style>