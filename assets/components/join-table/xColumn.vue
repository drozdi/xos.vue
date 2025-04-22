<script>
import {h, inject, onUnmounted} from 'vue'
export default {
  name: "xColumn",
  props: {
    header: String,
    field: String,
    size: {
      type: Number,
      default: 1,
      validate: (val) => val > 0
    },
    sortable: {
      type: Boolean,
      default: false,
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    isGrouped: {
      type: Boolean,
      default: false
    },
    isSorted: {
      type: Boolean,
      default: false
    },
    align: {
      type: String,
      default: 'left',
      validator: (v) => ['left', 'right', 'center'].includes(v)
    }
  },
  provide () {
    return {
      '__x_table': this
    }
  },
  inject: {
    '$table': {
      from: '__x_table',
      default: () => ({
        level: -1,
        columns: []
      })
    }
  },
  data () {
    return {
      level: 1,
      columns: []
    }
  },
  computed: {
    colspan () {
      return this.columns.reduce((sum, column) => {
        return sum + column.colspan
      }, 0) || this.size
    },
    isColumns () {
      return this.columns.length > 0
    },
    isHeader () {
      return !!this.header
    },
    isField () {
      return !!this.field
    },
    isEmpty () {
      return !this.field
    }
  },
  mounted () {
    this.level = this.$table.level + 1
    this.$table.columns.push(this)
  },
  unmounted () {
    this.$table.columns = this.$table.columns.filter((v) => v != this)
    this.level = 1
  }
}
</script>

<template>
  <slot name="default"></slot>
</template>

<style scoped>

</style>