<script>
  import { ref, computed } from "vue";
  import { QBtn } from 'quasar'
  import { minMax } from "../../utils/fns";

  export default {
    components: { QBtn },
    props: {
      modelValue: {
        type: Number,
        required: true
      },
      min: {
        type: [ Number, String ],
        default: 1
      },
      max: {
        type: [ Number, String ],
        required: true
      }
    },
    emits: ['update:modelValue'],
    setup (props, { emit }) {
      const propMin = computed(() => parseInt(props.min, 10))
      const propMax = computed(() => parseInt(props.max, 10))
      const current = computed({
        get: () => props.modelValue,
        set: (value) => {
          value = parseInt(value, 10)
          value = minMax(value, propMin.value, propMax.value)
          if (props.modelValue !== props.modelValue) {
            emit('update:modelValue', value)
          }
        }
      })
    }
  }
</script>

<template>

</template>

<style scoped>

</style>