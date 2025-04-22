<template>
  <win-form draggable resizable :id="id">
    <div class="q-pa-sm">
      <input v-if="exist" :="hidden('id')" />
      <q-input :="register('name', {
        label: t('props.name')
      })" />
      <select-software-type :="component('type_id', {
        label: t('props.type')
      })" />
      <select-software :="component('parent_id', {
        label: t('props.parent'),
        filters: filtersParent
      })" />
      <q-input :="register('sort', {
        type: 'number',
        label: t('props.sort')
      })" />
    </div>
  </win-form>
</template>

<script>
import { computed } from 'vue'
import winForm from "../../components/windows/winForm";
import selectSoftware from './components/select-software'
import selectSoftwareType from './components/select-software-type'


import {useApp} from "../../composables/useApp";
import {useSize} from "../../composables/useSize";
import {useSetting} from "../../composables/useSetting";
import {useI18n} from "../../composables/useI18n";
import {useAccess} from "../../composables/useAccess";
import {useForm} from "../../composables/useForm";
import softwareRepository from "./repository/software"
import initEvents from "./utils/software.events";

export default {
  name: "app-device-software",
  props: ['id', 'smKey', 'i18nKey', 'accessKey', 'filters'],
  emits: ["saved"],
  setup (props, { emit }) {
    const $app = useApp({
      i18nKey: 'device-software',
      accessKey: 'device.software',
      ...props
    })
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, exist, register, hidden, component } = useForm({}, {
      name: 'software',
      repository: softwareRepository,
      rules: {
        name: [
          v => !!v || 'Название обязательно',
        ],
        type_id: [
          v => !!v || 'Тип программы обязательно',
        ]
      }
    })

    initEvents($app)
    $app.on('saved', ($event) => {emit('saved', $event)});
    $app.on('loaded', () => {
      if (!exist.value && props.filters.type) {
        data.value.type_id = props.filters.type
      }
    })
    const filtersParent = computed(() => {
      return {
        type: data.value.type_id,
        parent: null,
        'id!': data.value.id
      }
    })
    return {
      exist, filtersParent, register, hidden, component,
      t: $i18n.t, checkHasScope: $access.checkHasScope
    }
  },
  components: { winForm, selectSoftware, selectSoftwareType }
}
</script>

<style scoped>

</style>