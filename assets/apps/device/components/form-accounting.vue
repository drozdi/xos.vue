<script>
import { computed, onUnmounted, watch } from 'vue'
import xDate from '../../../components/date-time/xDate.vue'
import selectPrototype from '../../../components/select-prototype.vue'
import { useI18n } from '../../../composables/useI18n'
import { useForm, useSubForm } from '../../../composables/useForm'
export default {
  name: "form-accounting",
  props: {
    name: {
      type: String,
      require: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    inNo: Boolean,
    attach: {
      type: [Boolean, Object],
      default: false
    }
  },
  emits: ['update:modelValue'],
  components: { xDate, selectPrototype },
  setup (props, { emit }) {
    const $i18n = useI18n('device.components.form-accounting')
    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    const { register, component, hidden } = (useSubForm(props.name) || useForm({}, {
      name: props.name
    }))
    const parents = computed(() => [{
      value: 'detach',
      label: $i18n.t('detach'),
      disable: !value.value.isChild
    }])
    onUnmounted(watch(() => value.value.dateDiscarded, (val) => {
      if (val) {
        value.value.discarded = true
      }
    }))
    onUnmounted(watch(() => value.value.discarded, (val) => {
      if (value.value.dateDiscarded) {
        value.value.discarded = true
      }
    }))
    return {
      value, register, component, hidden, parents, t: $i18n.t
    }
  }
}
</script>

<template>
  <div class="row q-col-gutter-md">
    <div v-if="attach !== false" class="col-12">
      <select-prototype :="component('parent_id', {
        label: t('attach'),
        filters: attach,
        source: '/device/accounting/list/select',
        options: parents
      })" />
    </div>
    <div class="col-6">
      <q-input v-if="inNo" :="register('inNo', {
        label: t('inNo'),
        readonly: value.isChild,
      })" dense />
      <q-input :="register('invoice', {
        label: t('invoice'),
        readonly: value.isChild
      })" dense />
      <x-date :="register('dateInvoice', {
        label: t('dateInvoice'),
        readonly: value.isChild,
        mask: 'YYYY-MM-DD'
      })" dense />
    </div>
    <div class="col-6">
      <div class="q-gutter-sm">
        <q-checkbox :="register('discarded', {
          label: t('discarded'),
          disable: value.isChild,
        })" />
      </div>
      <x-date :="register('dateDiscarded', {
        label: t('dateDiscarded'),
        readonly: value.isChild,
        mask: 'YYYY-MM-DD'
      })" dense />
    </div>
  </div>
  <q-input :="register('name', {
    type: 'textarea',
    label: t('name'),
    readonly: value.isChild
  })" dense />
</template>

<style scoped>

</style>