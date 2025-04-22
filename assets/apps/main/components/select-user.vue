<template>
  <select-prototype source="/main/user/list" :sort="[{
        'key': 'login',
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
  components: {selectPrototype},
  methods: {
    reset () {
      this.$refs.p.select.reset()
    },
    blur () {
      this.$refs.p.select.blur()
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
