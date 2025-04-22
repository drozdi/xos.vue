<template>
  <template v-if="'L' === opt.fieldType">
    <template v-if="'C' === opt.listType">
      <div class="row">
        <template v-if="opt.multiple">
          <span v-for="_enum in opt.enums">
            <q-checkbox size="xs" v-model="opt.valueL" :name="name+'[]'" :val="_enum.id" :label="_enum.name" />
          </span>
        </template>
        <template v-else>
          <span v-for="_enum in opt.enums">
            <q-radio size="xs" v-model="opt.valueL" :name="name" :val="_enum.id" :label="_enum.name" />
          </span>
        </template>
      </div>
    </template>
    <template v-else>
      <q-select
          v-bind="$attrs"
          v-model="opt.valueL"
          :multiple="opt.multiple"
          :name="name+(opt.multiple?'[]':'')"
          emit-value
          map-options
          :options="Object.values(opt.enums)"
          option-label="name"
          option-value="id" />
    </template>
  </template>
  <template v-else-if="'N' === opt.fieldType">
    <q-input
        v-bind="$attrs"
        v-model="opt.value"
        :name="name"
        type="number" />
  </template>
  <template v-else>
    <q-input
        v-bind="$attrs"
        v-model="opt.value"
        :name="name" />
  </template>
</template>

<script>
import { computed, watch, onUnmounted, onMounted, nextTick, onUpdated } from 'vue'

export default {
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const opt = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    switch (opt.value.fieldType) {
      case "L":
        onUnmounted(watch(() => opt.value.valueL, () => {
          opt.value.value = opt.value.valueS = [].concat(opt.value.valueL).map((val) => {
            return opt.value.enums[val].name
          }).join(', ')
        }))
        break
      case "N":
        onUnmounted(watch(() => opt.value.value, () => {
          opt.value.valueN = opt.value.valueS = opt.value.value
        }))
        break
      default:
        onUnmounted(watch(() => opt.value.value, () => {
          opt.value.valueS = opt.value.value
        }))
        break
    }
    return {
      opt
    }
  }
}
</script>

<style scoped>

</style>