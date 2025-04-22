<template>
  <dr-re
      :z="z" v-show="!collapse"
      :class="{
        [className(null, 'fullscreen')]: fullscreen,
        [className(null, 'collapsed')]: collapse
      }"
      :class-name="className()"
      :class-name-draggable="className(null, 'draggable')"
      :class-name-resizable="className(null, 'resizable')"
      :class-name-dragging="className(null, 'dragging')"
      :class-name-resizing="className(null, 'resizing')"
      :class-name-active="className(null, 'active')"
      :class-name-handle="className('res')"
      :drag-handle="'.'+className('drag')"
      :drag-cancel="'.'+className('drag-no')"
      :draggable="draggable"
      :resizable="resizable"
      @activated="onFocus"
      @deactivated="onBlur"
      @resize="$emit('resize', $event)"
      @drag="$emit('drag', $event)">
    <q-dialog v-model="closeDialog" persistent>
      <q-card>
        <q-toolbar>
          <q-toolbar-title>
            <slot name="close-title">{{ t("confirm.close.title") }}</slot>
          </q-toolbar-title>
          <q-btn flat icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="row items-center">
          <slot name="close-message">{{ t("confirm.close.message") }}</slot>
        </q-card-section>
        <q-card-actions align="right">
          <slot name="close-actions" v-bind="{ close: onClose, closeCancel: onCloseCancel, closeApply: onCloseApply, fullscreen, collapse }">
            <q-btn flat color="primary" @click="onCloseCancel" :label="t('btn.no')" />
            <q-btn flat color="primary" @click="onCloseApply" :label="t('btn.yes')" />
          </slot>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-bar :class="['q-pr-none bg-transparent', className('title-bar'), fullscreen? '': className('drag')]" @dblclick="fullscreen = !fullscreen">
      <slot name="title" v-bind="{ className: className('title')}">
        <div :class="className('title')">
          {{title}}
        </div>
      </slot>
      <q-space />
      <div :class="[className('drag-no')]">
        <template v-for="item in actions">
          <q-btn flat dense v-bind="item" />
        </template>
        <template v-for="val in icons">
          <q-btn flat dense v-bind="icon(val)" />
        </template>
      </div>
    </q-bar>
    <div :class="className('body')" :style="styleBody">
      <slot name="default" v-bind="{ close: onClose, closeCancel: onCloseCancel, closeApply: onCloseApply, fullscreen, collapse }"></slot>
    </div>
  </dr-re>
</template>

<script>
import { getCurrentInstance, ref, computed, nextTick, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from "quasar";

import wm from '../../apps/wm'
import zIndex from "../../apps/zIndex";
import { settingManager } from "../../apps/core";

import { makeWindowProps, makeDRProps } from "../props";

import drRe from '../dr-re/dr-re';
import {
  provideWindowProps,
  provideDRProps,
} from "../../composables/provide";
import { getComputedSize } from "../../utils/dom";
import { parentProps, propsParent, propsProvide } from "../../utils/props";
import { isBoolean } from "../../utils/fns";

import { useApp, injectApp } from "../../composables/useApp";
import { useSize } from "../../composables/useSize";
import { useAccess } from "../../composables/useAccess";
import { useSetting } from "../../composables/useSetting";
import { useClassName } from "../../composables/useClassName";
import { useI18n } from "../../composables/useI18n";
export default {
  name: "x-window",
  components: { drRe },
  props: propsParent(makeWindowProps, provideWindowProps, {
    w: () => settingManager.WINDOW.get('w'),
    h: () => settingManager.WINDOW.get('h'),
    x: () => settingManager.WINDOW.get('x'),
    y: () => settingManager.WINDOW.get('y'),
    parent: () => settingManager.WINDOW.get('parent'),
    draggable: true,
    resizable: true,
  }),
  emits: ['focus', 'blur', 'resize', 'drag', 'close', 'fullscreen', 'collapse', 'reload'],
  setup (props, { emit }) {
    const $app = injectApp(null)
    const $size = useSize(props.w, props.h)
    const $sm = useSetting()
    const $i18n = useI18n()
    const $access = useAccess()
    const { className, queryName } = useClassName()

    let vm = getCurrentInstance()?.proxy

    function __emit (...args) {
      emit(...args)
      $app?.emit(...args)
    }

    const z = ref(props.z)
    const collapse = ref(false)
    const fullscreen = ref(false)
    const closeDialog = ref(false)

    let restoreState = {
      top: $size.top,
      left: $size.left,
      width: $size.width,
      height: $size.height
    }

    function __canDo (action = '') {
      return props.icons.indexOf(action) > -1
    }
    function __savePositionAndSize () {
      restoreState.top = $size.top
      restoreState.left = $size.left
      restoreState.width = $size.width
      restoreState.height = $size.height
    }
    function __restorePositionAndSize () {
      $size.top = restoreState.top
      $size.left = restoreState.left
      $size.width = restoreState.width
      $size.height = restoreState.height
    }
    function __nullPositionAndSize (left = null, top = null, width = null, height = null) {
      $size.left = left;
      $size.top = top;
      $size.width = width;
      $size.height = height;
    }

    function icon (type) {
      if (type === "collapse") {
        return {
          onClick: () => collapse.value = true,
          icon: 'minimize',
          title: $i18n.t('btn.collapse'),
          //icon: collapse.value? 'mdi-arrow-collapse-up': 'mdi-arrow-collapse-down'
        }
      } else if (type === "fullscreen") {
        return {
          onClick: () => fullscreen.value = !fullscreen.value,
          icon: fullscreen.value? 'mdi-fullscreen-exit': 'mdi-fullscreen',
          title: fullscreen.value? $i18n.t('btn.unFullscreen'): $i18n.t('btn.fullscreen'),
        }
      } else if (type === "close") {
        return {
          onClick: onClose,
          color: "red",
          icon: "close",
          title: $i18n.t('btn.close'),
        }
      } else if (type === "reload") {
        return {
          onClick: onReload,
          icon: "mdi-reload",
          title: $i18n.t('btn.reload'),
        }
      }
      return null;
    }

    function onClose (event) {
      if (!__canDo('close')) {
        return false;
      }
      closeDialog.value = !props.autoClose
      props.autoClose && onCloseApply(event)
    }
    function onCloseApply ($event) {
      closeDialog.value = false
      __emit('close', $event)
    }
    function onCloseCancel () {
      closeDialog.value = false
    }

    function onReload ($event) {
      __emit('reload', $event)
    }

    function onFocus ($event) {
      __emit('focus', $event)
      if ($app) {
        $app.emit('activated', $event)
      } else {
        onActive($event)
      }
    }
    function onBlur ($event) {
      __emit('blur', $event)
      if ($app) {
        $app.emit('deactivated', $event)
      } else {
        onActive($event)
      }
    }

    function onActive ($event) {
      wm?.active(vm)
      z.value = zIndex.value++
      $size.active = true
      collapse.value = false
    }
    function onDeActive ($event) {
      nextTick(() => {
        if (wm?.isActive(vm)) {
          wm?.disable()
        }
      })
    }

    $app?.on('activated', onActive)
    $app?.on('deactivated', onDeActive)

    const styleBody = computed(() => {
      return {
        height: ($size.height-(vm.$el?getComputedSize(queryName('title-bar'))[1]:0))+'px'
      }
    })

    onUnmounted(watch(() => $size.width,(val) => {$sm.set('w', val)}))
    onUnmounted(watch(() => $size.height,(val) => {$sm.set('h', val)}))
    onUnmounted(watch(() => $size.left,(val) => {$sm.set('x', val)}))
    onUnmounted(watch(() => $size.top,(val) => {$sm.set('y', val)}))
    onUnmounted(watch(() => $size.active,(val) => {$sm.set('active', val)}))
    onUnmounted(watch(() => fullscreen.value, (val) => {
      if (!__canDo('fullscreen')) {
        return;
      }
      $sm.set('fullscreen', val);
      $size.active = true;
      if (val) {
        if (collapse.value) {
          collapse.value = false;
        }
        __savePositionAndSize()
        let [width, height] = getComputedSize(props.parent)
        $sm.noSave(() => __nullPositionAndSize(null, null, width, height))
      } else {
        __restorePositionAndSize()
      }
      __emit("fullscreen", val);
    }))
    onUnmounted(watch(() => collapse.value, (val) => {
      if (!__canDo('collapse')) {
        return;
      }
      $sm.set('collapse', val);
      if (val) {
        if (fullscreen.value) {
          fullscreen.value = false;
        }
        __savePositionAndSize()
        $sm.noSave(__nullPositionAndSize)
      } else {
        __restorePositionAndSize()
      }
      __emit("collapse", val);
    }))

    onMounted(() => {
      vm = getCurrentInstance().proxy
      let style = getComputedStyle(vm.$el)
      z.value = zIndex.value = Math.max(zIndex.value, parseInt(style.zIndex, 10) || 0)
      z.value = ++zIndex.value
      wm?.add(vm)
      $sm.noSave(() => {
        $size.left = $sm.get('x', 0, Number) || $size.left
        $size.top = $sm.get('y', 0, Number) || $size.top
        $size.width = $sm.get('w', $size.width, Number) || $size.width
        $size.height = $sm.get('h', $size.height, Number) || $size.height
        //collapse.value = $sm.get('collapse', false, Boolean)
        fullscreen.value = $sm.get('fullscreen', false, Boolean)
        $sm.get('active', false, Boolean) && nextTick(() => {
          onFocus()
        })
        $sm.get('collapse', false, Boolean) && nextTick(() => {
          collapse.value = true
        })
      })
      onFocus()
    })
    onBeforeUnmount(() => {
      wm?.del(vm)
    })
    onUnmounted(() => {
      $app?.off('activated', onActive)
      $app?.off('deactivated', onDeActive)
      if ($app) {
        delete $app.instances.win
      }
    })

    return {
      styleBody, collapse, fullscreen, closeDialog, z, className,
      onClose, onCloseCancel, onCloseApply, icon, onFocus, onBlur, t: $i18n.t
    }
  },
  provide () {
    return {
      'layout.container': true,
      [provideDRProps]: propsProvide(this.$props, makeDRProps)
    }
  }
}
</script>

<style lang="scss">
@import "../../scss/tools/namespace";
@import "../../styles/quasar.variables";

$spacer:                            1rem !default;

$xWindow-min-width:							    350px !default;
$xWindow-max-width:							    none !default;
$xWindow-min-height:						    250px !default;
$xWindow-max-height:						    none !default;

$xWindow-gutter-width:						  $spacer !default;

$xWindow-res-width:						      .5rem !default;
$xWindow-res-offset:						    ($xWindow-res-width / -2) !default;

$xModal-icon-size: 						      8px !default;
$xModal-icon-offset: 					      ($xModal-icon-size * 0.75) !default;

$xWindow-title-offset-horizontal:		$xWindow-gutter-width !default;
$xWindow-title-offset-vertical:			$xWindow-gutter-width / 2 !default;

$xWindow-header-padding:					  ($xWindow-gutter-width / 2) !default;
$xWindow-header-item-offset:				($xWindow-header-padding / 1) !default;

$xWindow-footer-padding:					  ($xWindow-gutter-width / 2) !default;
$xWindow-footer-item-offset:				($xWindow-footer-padding / 2) !default;

$xWindow-line-width: 					      8rem/16 !default;
$xWindow-line-border-width: 		    1rem/16 !default;
$xWindow-line-size: 						    ($xWindow-line-width + $xWindow-line-border-width) !default;
$xWindow-line-offset: 					    8rem !default;
$xWindow-line-offset-border:		    ($xWindow-line-offset + $xWindow-line-border-width) !default;

@include namespace('@xWindow', true) {
  @include name {
    --x-window-bg: #fff;
    --x-window-border: #{$separator-color};
    --x-window-select: #{$primary};
    --x-window-select-active: #{$info};
  }
  .body--dark {
    @include name {
      --x-window-bg: #{$dark-page};
      --x-window-border: #{$separator-dark-color};
    }
  }


  @include name {
    position: absolute;
    margin: 0;
    padding: 0;
    min-width: $xWindow-min-width;
    max-width: $xWindow-max-width;
    min-height: $xWindow-min-height;
    max-height: $xWindow-max-height;
    border: 1px solid transparent;
  }
  @include name(title) {
    margin: $xWindow-title-offset-vertical $xWindow-title-offset-horizontal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @include name(title-bar) {
    border: 1px solid var(--x-window-border);
  }
  @include name (body) {
    width: 100%;
    overflow: auto;
    max-height: 100%;
  }

  /* resize */
  @include name(res) {
    position: absolute;
    z-index: 100;
    display: none;
  }
  @include name(res-n res-s) {
    height: $xWindow-res-width;
    left: 0;
    right: 0;
    cursor: n-resize;
  }
  @include name(res-e res-w) {
    width: $xWindow-res-width;
    top: 0;
    bottom: 0;
    cursor: e-resize;
  }

  @include name(res-se res-sw res-ne res-nw) {
    height: $xWindow-res-width;
    width: $xWindow-res-width;
    z-index: 110;
  }
  @include name(res-nw) {
    cursor: nw-resize;
  }
  @include name(res-ne) {
    cursor: ne-resize;
  }
  @include name(res-se) {
    cursor: se-resize;
  }
  @include name(res-sw) {
    cursor: sw-resize;
  }

  @include name(res-n res-nw res-ne) {
    top: $xWindow-res-offset;
  }
  @include name(res-e res-ne res-se) {
    right: $xWindow-res-offset;
  }
  @include name(res-s res-se res-sw) {
    bottom: $xWindow-res-offset;
  }
  @include name(res-w res-nw res-sw) {
    left: $xWindow-res-offset;
  }
  @include name(null, resizable) {
    > { @include name(res) {
      display: block;
    } }
  }
  /* mod */
  @include name(null, collapsed fullscreen) {
    min-width: 0;
    max-width: none;
    min-height: 0;
    max-height: none;
    @include name(res) {
      display: none !important;
    }
  }
  @include name(null, collapsed) {
    min-width: 100px;
  }
  @include name(null, fullscreen) {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  @include name(null, 'draggable:not(#{name(null, fullscreen)})') {
    @include name(drag) { cursor: move !important; }
    @include name(drag-no, ':not(#{name(res)})') { cursor: default !important; }
  }
  /* style */
  @include name {
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.07) inset;
    background-color: var(--x-window-bg);
    border-color: var(--x-window-border);
    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: $xWindow-line-offset;
      right: $xWindow-line-offset;
      display: block;
      height: 0;
      border-top: $xWindow-line-size solid var(--x-window-border);
      border-left: $xWindow-line-size solid transparent;
      border-right: $xWindow-line-size solid transparent;
    }
    &:after {
      content: " ";
      position: absolute;
      top: 0;
      left: $xWindow-line-offset-border;
      right: $xWindow-line-offset-border;
      display: block;
      height: 0;
      border-top: $xWindow-line-width solid var(--x-window-select);
      border-left: $xWindow-line-width solid transparent;
      border-right: $xWindow-line-width solid transparent;
    }
  }
  @include name(null, active) {
    &:after {
      border-top: $xWindow-line-width solid var(--x-window-select-active);
    }
  }
  @include name {
    @include namespace('@xLayout', true) {
      @include namespace-down {
        @include name {
          width: 100%;
          height: 100%;
        }
        @include name (content, footer) {
          padding: $xWindow-footer-padding $xWindow-footer-item-offset;
        }
      }
    }
  }
}
</style>