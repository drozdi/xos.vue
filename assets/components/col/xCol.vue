<script>
import {h, inject, defineProps, computed} from 'vue'
import {makeProp, makeProps} from '../../utils/props.js';
import {camelize, capitalize} from '../../utils/string.js';
import { breakpoints } from '../../utils/breakpoints';
import { provideAppSize } from "../../composables/provide";
import {useQuasar} from "quasar";
import { getComputedSize } from '../../utils/dom'

import { injectSize } from '../../composables/useSize'
import { useGridSize } from "../../composables/useGrid";

export default {
  name: "x-col",
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
      class: ['col', 'col-'+size.value]
    }, [slots.default()])
  }
}
</script>

<style lang="scss">

</style>