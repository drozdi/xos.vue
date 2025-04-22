<script>
import { computed, watch, onUnmounted } from "vue";

export default {
  name: "xSideFilter",
  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },
    options: {
      type: Object,
      default: () => ({})
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionSubLabel: {
      type: String,
      default: 'sublabel'
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    dense: Boolean,
    clickable: Boolean
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const active = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    onUnmounted(watch(() => props.options, () => {
      if (active.value) {
        return
      }
      for (let i = 0, cnt = props.options.length || 0; i < cnt; i++) {
        if (props.options[i][props.optionValue]) {
          active.value = props.options[i][props.optionValue]
          break;
        }
      }
    }))
    return { active }
  }
}
</script>

<template>
  <q-list>
    <template v-for="item in options">
      <q-separator v-if="item.type === 'divider'" spaced />

      <q-item-label v-else-if="item.type === 'header'" header>{{ item[optionLabel] }}</q-item-label>

      <q-item v-else-if="item.type === 'subheader'" :dense="dense" >
        <q-item-section>
          <q-item-label class="q-py-none" header>{{ item[optionLabel] }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label caption>{{ item[optionSubLabel] }} </q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-else @click="active = item[optionValue]" :dense="dense" :active="active === item[optionValue]" :clickable="clickable">
        <q-item-section>
          <q-item-label>{{ item[optionLabel] }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label caption>{{ item[optionSubLabel] }} </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<style scoped>

</style>