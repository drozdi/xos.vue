<template>
  <select-prototype source="/device/software/type/select" :sort="[{
        'key': 'sort',
        'order': 'ASC'
      }]" option-value="id" option-label="name" ref="p">
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
      this.$refs.p.reset()
    }
  },
  computed: {
    parentSlots () {
      return Object.keys(this.$slots)
    },
    items () {
      return this.$refs.p.items
    }
  }
}
</script>

<style scoped>

</style>