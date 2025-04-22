<script>
import { h } from 'vue'
import { useGridSize } from "../../composables/useGrid";

export default {
  name: "x-row",
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    grid: {
      type: Object,
      default: () => ({})
    }
  },
  setup (props, { slots }) {
    const size = useGridSize(props.grid)
    return () => h(props.tag, {
      class: ['row', 'x-row-'+size.value]
    }, [slots.default()])
  }
}
</script>

<style lang="scss">
  $grid-cols: 6 !default;
  .x-row {
    @for $index from 1 through $grid-cols {
      &-#{$index} {
        > .col {
          flex: 0 1 percentage(1/$index) !important;
          width: percentage(1/$index) !important;
        }
      }
    }
  }
</style>