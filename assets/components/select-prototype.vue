<template>
  <q-select
      :loading="loading"
      :options="items"
      fill-input
      use-input
      emit-value
      hide-selected
      map-options
      @filter="filterFn"
      ref="select">
    <template #no-option="args">
      <slot name="no-option" v-bind="args">
        <q-item>
          <q-item-section class="text-grey">
            {{ t('no-results') }}
          </q-item-section>
        </q-item>
      </slot>
    </template>
    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <slot name="option" v-bind="{ itemProps, opt, selected, toggleOption }">
        <template v-if="opt.type === 'divider'">
          <q-separator spaced />
        </template>
        <template v-else-if="opt.type === 'subheader'">
          <q-item-label header>{{ opt.label }}</q-item-label>
        </template>
        <template v-else>
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label v-html="opt.label" />
              <q-item-label v-if="opt.sublabel" v-html="opt.sublabel" caption />
            </q-item-section>
          </q-item>
        </template>
      </slot>
    </template>
    <template v-for="slot in parentSlots" #[slot]="args">
      <slot :name="slot" v-bind="args" />
    </template>
  </q-select>
</template>

<script>
import { QSelect } from 'quasar'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { parse, format } from "../utils/request";
import { useI18n } from "../composables/useI18n";
import axios from '../plugins/axios'

export default {
  name: "select-prototype",
  inheritAttrs: true,
  components: { QSelect },
  props: {
    source: {
      type: String,
      required: true
    },
    filters: {
      type: Object,
      default: () => ({})
    },
    sort: {
      type: Array,
      default: () => ([])
    },
    options: {
      type: Array,
      default: () => ([])
    }
  },
  setup (props, { emit, slots, attrs }) {
    const loading = ref(false)
    const items = ref(props.options)
    let orig = props.options
    const select = ref(null)
    const parentSlots = computed(() => {
      return Object.keys(slots).filter(name => name != "no-option" && name != "option")
    })
    function load () {
      loading.value = true;
      let data = {
        t: "select",
        limit: -1,
        offset: 1,
        sortBy: props.sort,
        filters: {}
      };
      format(data['filters'], parse(props.filters));
      return axios.post(props.source, data).then(({data}) => {
        loading.value = false
        orig = props.options.concat(data)
        items.value = props.options.concat(data)
        reset()
      });
    }
    function reset () {
      select.value.reset()
    }
    function blur () {
      select.value.blur()
    }
    function filterFn (val, update) {
      if (val === '') {
        update(() => {
          items.value = orig
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        items.value = orig.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }
    onUnmounted(watch(() => props.filters, () => {
      load()
    }, { deep: true }))
    onMounted(() => {
      load()
    })
    return {
      loading, select, parentSlots, items,
      reset, blur, filterFn, t: useI18n().t
    }
  }
}
</script>

<style scoped>

</style>