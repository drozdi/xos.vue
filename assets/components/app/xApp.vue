<template>
  <slot name="default" />
</template>

<script>
import { defineComponent } from 'vue'
import props from './props'
import { provideApp } from "../../composables/useApp";
import { provideSize } from "../../composables/useSize";

export default defineComponent(function xApp (props, { emit }) {

}, {
  name: "x-app",
  props: props,
  emits: [],
})
</script>

<style scoped>

</style>