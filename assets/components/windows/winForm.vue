<template>
  <x-window :title="wTitle" :auto-close="!updated" :icons="['reload', 'collapse', 'fullscreen', 'close']" @reload="onReload">
    <template #close-message>
      {{t('confirm.close.message', { name: wTitle })}}
    </template>
    <template #close-actions="{ close, closeCancel, closeApply }">
      <q-btn color="blue" @click="closeCancel">{{ t("btn.no") }}</q-btn>
      <q-btn color="blue" @click="closeApply">{{ t("btn.yes") }}</q-btn>
      <q-btn color="green" @click="closeCancel(); onSave(true);">{{ t("btn.save_close") }}</q-btn>
    </template>
    <template #default="{ close, closeCancel, closeApply }">
      <x-layout container is-footer>
        <template #default="args">
          <q-form :="attrs">
            <slot name="default" v-bind="args"></slot>
          </q-form>
          <pre>
            {{ data }}
          </pre>
        </template>
        <template #menu="args">
          <slot name="menu" v-bind="args" />
        </template>
        <template #footer="args">
          <slot name="footer" v-bind="{ ...args, loading, save: onSave }">
            <q-btn :disable="!allow" :loading="loading" icon="mdi-content-save-check" text-color="positive" @click="onSave(false)" :title="t('btn.apply')" />
            <q-separator vertical inset />
            <q-btn :disable="!allow" :loading="loading" icon="mdi-content-save-all" text-color="primary" @click="onSave(true)" :title="t('btn.save')" />
            <q-space />
            <q-btn :disable="!checkHasScope('can_read')" :loading="loading" icon="mdi-reload" text-color="secondary" @click="onReload" :title="t('btn.reset')" />
            <q-separator vertical inset />
            <q-btn :loading="loading" icon="mdi-close-box" text-color="accent" @click="close" :title="t('btn.close')" />
          </slot>
        </template>
      </x-layout>
    </template>
  </x-window>
</template>

<script>
import { ref, computed, getCurrentInstance, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { appsManager } from '../../apps/core'

import xWindow from "../window/xWindow";
import XLayout from "../layout/xLayout";

import props from "./form";

import { provideWindowProps, provideLayoutProps } from '../../composables/provide'

import axios from '../../plugins/axios'
import { parameterize } from "../../utils/request";

import {useApp} from "../../composables/useApp"
import {useSize} from "../../composables/useSize"
import {useTable} from "../../composables/useTable"
import {useForm} from "../../composables/useForm"
import {useI18n} from "../../composables/useI18n"
import {useSetting} from "../../composables/useSetting"
import {useAccess} from "../../composables/useAccess"
export default {
  name: "win-form",
  props: props,
  emits: ["saved", "created", "updated", "loaded"],
  setup (props, { emit }) {
    const $app = useApp()
    const $size = useSize()
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { data, errors, state: {
      repository
    }, attrs, exist, canAccess, reset } = useForm()

    const allow = $access.checkHasScope(canAccess.value)
    let vm = getCurrentInstance()?.proxy

    function __emit (...args) {
      $app?.emit(...args)
      emit(...args)
    }

    const loading = ref(false)
    const updated = ref(false)

    function getMethodDetail (id = 0) {
      return repository?
          repository.get(id):
          axios.get(parameterize(props.source, {id: id}))
    }
    function getMethodSave (id, data) {
      if (id > 0) {
        return getMethodUpdate(id, data)
      }
      return getMethodCreate(data)
    }
    function getMethodCreate (data) {
      return repository?
          repository.create(data):
          axios.post(props.create, data)
    }
    function getMethodUpdate (id, data) {
      return repository?
          repository.update(id, data):
          axios.put(parameterize(props.update, {id: id}), data)
    }

    function onClose () {
      __emit('close')
    }

    function load (id = 0) {
      loading.value = id > 0
      getMethodDetail(id).then(({data: res}) => {
        reset(res)
        $sm.set('id', data.value.id)
        __emit('loaded', data.value)
        nextTick(() => {
          loading.value = false
          updated.value = false
        })
      })
    }
    function onSave (close) {
      //console.log({...data.value})
      loading.value = true;
      getMethodSave(data.value.id, {...data.value}).then(({data: res, status}) => {
        updated.value = false
        if (status === 201) {
          data.value.id = res
          $sm.set('id', data.value.id);
        }
        if (200 <= status && status < 300) {
          getMethodDetail(data.value.id).then(({data: res}) => {
            reset(res)
            __emit('loaded', data.value)
            __emit('saved', data.value)
            __emit(exist.value? 'updated': 'created', data.value)

            if (!exist.value) {
              appsManager.updateApp(vm, data.value)
              appsManager.reBuildApp(vm)
            }
            nextTick(() => {
              loading.value = false
              updated.value = false
              close && onClose()
            })
          })
        } else {
          nextTick(() => {
            loading.value = false
            updated.value = false
          })
        }
      }, ({data}) => {
        loading.value = false
        errors.value = data
      })//*/
    }

    $app?.on('reload', () => {
      load(data.value.id || props.id)
    })
    onUnmounted(watch(() => data.value, () => {
      updated.value = true
    }, {deep: true}))
    onMounted(() => {
      vm = getCurrentInstance().proxy
      load($sm.get('id', props.id));
    })
    const wTitle = computed({
      get: () => {
        return $i18n.t(!!exist.value ? "title" : "new", data.value)
      },
      set: (value) => {
        
      }
    })
    function onReload () {
      load($sm.get('id', props.id))
    }
    return {
      data, wTitle, loading, updated, attrs,
      t: $i18n.t, checkHasScope: $access.checkHasScope, allow,
      onReload, onSave, onClose
    }
  },
  components: { XLayout, xWindow },
  provide () {
    return {
      [provideWindowProps]: this.$props,
      [provideLayoutProps]: this.$props
    }
  }
}
</script>

<style scoped>

</style>