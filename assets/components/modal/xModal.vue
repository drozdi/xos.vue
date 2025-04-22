<template>
  <dr-re
      :z="zIndex"
      :class="{
        [className(null, 'fullscreen')]: fullscreen,
        [className(null, 'collapsed')]: collapse
      }"
      @activated="onFocus"
      @deactivated="onBlur"
      @resize="$emit('resize', $event)"
      @drag="$emit('drag', $event)"
      :class-name="className()"
      :class-name-draggable="className(null,'draggable')"
      :class-name-resizable="className(null,'resizeble')"
      :class-name-dragging="className(null,'dragging')"
      :class-name-resizing="className(null,'resizing')"
      :class-name-active="className(null,'focusin')"
      :class-name-handle="className('res')"
      :drag-handle="'.'+className('drag')"
      :drag-cancel="'.'+className('drag-no')">

    <q-bar v-if="icons.length || Object.keys(actions).length > 0" :class="[className('drag-no'), className('icons')]">
      <template v-for="item in actions">
        <q-btn flat square v-bind="item" />
      </template>
      <template v-for="val in icons">
        <q-btn flat square v-bind="icon(val)" />
      </template>
    </q-bar>

    <slot></slot>
  </dr-re>
</template>

<script>
import drRe from '../dr-re/dr-re';

import { addEvent, removeEvent, getComputedSize } from '../../utils/dom';

import zIndex from "../../apps/zIndex";

import { parentProps } from '../../utils/props'
import defModalProps from "./default";
import { makeModalProps } from "./props";

import setting from '../../mixins/setting'
import className from '../../mixins/className'
import dr from '../../mixins/draggable-resizable'

import {
  provideWindow,
  provideModal } from "../../composables/provide";

let arrFocus = {};
let currentFocus = null;

export default {
  name: "x-modal",
  components: {
    drRe
  },
  provide () {
    return {
      [provideModal]: this,
    }
  },
  props: parentProps(makeModalProps, {}, provideWindow),
  mixins: [setting, className, dr],
  emits: [
    'focus',
    'blur',
    'open',
    'close',
    'reload',
    'fullscreen',
    'collapse',
    'resize',
    'drag'
  ],
  data: function () {
    return {
      zIndex: this.z,
      collapse: false,
      fullscreen: false,
      restoreState: {
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height
      }
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.smNoSave(() => {
        this.left = this.smGet('x', 0, Number) || this.left
        this.top = this.smGet('y', 0, Number) || this.top
        this.width = this.smGet('w', this.width, Number) || this.width
        this.height = this.smGet('h', this.height, Number) || this.height
        this.collapse = this.smGet('collapse', false, Boolean)
        this.fullscreen = this.smGet('fullscreen', false, Boolean)
        this.smGet('active', false, Boolean) && this.onFocus();
      })
    })
    let style = getComputedStyle(this.$el);
    this.zIndex = zIndex.value = Math.max(zIndex.value, parseInt(style.zIndex, 10) || 0);
    this.zIndex = ++zIndex.value;
    arrFocus[this.$.uid] = this;
    addEvent(this.$el, 'click', this.onFocus);
  },
  unmounted () {
    delete arrFocus[this.$.uid];
    removeEvent(this.$el, 'click', this.onFocus);
  },
  methods: {
    __canDo (action = '') {
      return this.icons.indexOf(action) > -1
    },
    __savePositionAndSize () {
      this.restoreState.top = this.top
      this.restoreState.left = this.left
      this.restoreState.width = this.width
      this.restoreState.height = this.height
    },
    __restorePositionAndSize () {
      this.top = this.restoreState.top
      this.left = this.restoreState.left
      this.width = this.restoreState.width
      this.height = this.restoreState.height
    },
    __nullPositionAndSize (left = null, top = null, width = null, height = null) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
    },

    icon (type) {
      if (type === "collapse") {
        return {
          onClick: () => { this.collapse=!this.collapse },
          icon: this.collapse? 'mdi-arrow-collapse-up': 'mdi-arrow-collapse-down'
        }
      } else if (type === "fullscreen") {
        return {
          onClick: () => { this.fullscreen=!this.fullscreen },
          icon: this.fullscreen? 'mdi-fullscreen-exit': 'mdi-fullscreen'
        }
      } else if (type === "close") {
        return {
          color: "red",
          icon: "mdi-close",
          onClick: this.close
        }
      } else if (type === "reload") {
        return {
          icon: "mdi-reload",
          onClick: () => {
              this.$emit('reload')
          }
        }
      }
      return null;
    },
    close (event) {
      if (!this.__canDo('close')) {
        return false;
      }
      this.$emit("close", event);
    },
    open (event) {
      this.$emit("open", event);
    },
    onFocus: function () {
      currentFocus && arrFocus[currentFocus]? arrFocus[currentFocus].active = false: '';
      currentFocus = this.$.uid;
      this.active = true;
      this.zIndex = zIndex.value++
      this.$emit('focus');
    },
    onBlur: function () {
      currentFocus && arrFocus[currentFocus]? arrFocus[currentFocus].active = false: '';
      this.$emit('blur');
    },
    onDblclick: function () {
      this.fullscreen = !this.fullscreen;
    }
  },
  watch: {
    'dr.w': function (val) {
      this.smSet('w', val)
    },
    'dr.h': function (val) {
      this.smSet('h', val)
    },
    'dr.x': function (val) {
      this.smSet('x', val)
    },
    'dr.y': function (val) {
      this.smSet('y', val)
    },
    'dr.active': function (val) {
      this.smSet('active', val)
    },
    fullscreen: function (val) {
      if (!this.__canDo('fullscreen')) {
        return;
      }
      this.smSet('fullscreen', val);
      this.onFocus();
      if (val) {
        if (this.collapse) {
          this.collapse = false;
        }
        this.__savePositionAndSize()
        let [, height] = getComputedSize(this.parent)
        this.smNoSave(() => this.__nullPositionAndSize(null, null, null, height))
      } else {
        this.__restorePositionAndSize()
      }
      this.$emit("fullscreen", val);
    },
    collapse: function (val) {
      if (!this.__canDo('collapse')) {
        return;
      }
      this.smSet('collapse', val);
      if (val) {
        if (this.fullscreen) {
          this.fullscreen = false;
        }
        this.__savePositionAndSize()
        this.smNoSave(this.__nullPositionAndSize)
      } else {
        this.__restorePositionAndSize()
      }
      this.$emit("collapse", val);
    }
  },
  computed: {

  }
}
</script>

<style lang="scss">
@import "../../scss/tools/namespace";
@import "../../styles/quasar.variables";

$xModal-min-width:						350px !default;
$xModal-max-width:						600px !default;
$xModal-min-height:						250px !default;
$xModal-max-height:						300px !default;

$xModal-res-width:						.5rem !default;
$xModal-res-offset:						($xModal-res-width / -2) !default;

$xModal-line-width: 					8rem/16 !default;
$xModal-line-border-width: 		1rem/16 !default;
$xModal-line-size: 						($xModal-line-width + $xModal-line-border-width) !default;
$xModal-line-offset: 					8rem !default;
$xModal-line-offset-border:		($xModal-line-offset + $xModal-line-border-width) !default;



@include namespace('@xModal', true) {
  @include name {
    --x-modal-bg: #fff;
    --x-modal-border: #{$separator-color};
    --x-modal-select: #{$primary};
    --x-modal-select-active: #{$info};
  }
  .body--dark {
    @include name {
      --x-modal-bg: #{$dark-page};
      --x-modal-border: #{$separator-dark-color};
    }
  }

  @include name {
    //overflow: hidden;
    padding: 0;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
    cursor: default;

    min-width: $xModal-min-width;
    max-width: $xModal-max-width;
    min-height: $xModal-min-height;
    max-height: $xModal-max-height;

    border: $xModal-line-border-width solid transparent;
  }

  /* icons */
  @include name(icons) {
    position: absolute;
    z-index: 100000;
    background: transparent;
    top: 0;
    right: 0;
    height: auto;
    padding: 0;
  }

  /* resize */
  @include name(res) {
    position: absolute;
    z-index: 100;
    display: none;
  }
  @include name(res-n res-s) {
    height: $xModal-res-width;
    left: 0;
    right: 0;
    cursor: n-resize;
  }
  @include name(res-e res-w) {
    width: $xModal-res-width;
    top: 0;
    bottom: 0;
    cursor: e-resize;
  }

  @include name(res-se res-sw res-ne res-nw) {
    height: $xModal-res-width;
    width: $xModal-res-width;
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
    top: $xModal-res-offset;
  }
  @include name(res-e res-ne res-se) {
    right: $xModal-res-offset;
  }
  @include name(res-s res-se res-sw) {
    bottom: $xModal-res-offset;
  }
  @include name(res-w res-nw res-sw) {
    left: $xModal-res-offset;
  }

  @include name(null, resizeble) {
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
      display: none;
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
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.75), 0px 0px 0px 1px rgba(255, 255, 255, 0.07) inset;
    background-color: var(--x-modal-bg);
    border-color: var(--x-modal-border);
    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: $xModal-line-offset;
      right: $xModal-line-offset;
      display: block;
      height: 0;
      border-top: $xModal-line-size solid var(--x-modal-border);
      border-left: $xModal-line-size solid transparent;
      border-right: $xModal-line-size solid transparent;
      z-index: 1;
    }
    &:after {
      content: " ";
      position: absolute;
      top: 0;
      left: $xModal-line-offset-border;
      right: $xModal-line-offset-border;
      display: block;
      height: 0;
      border-top: $xModal-line-width solid var(--x-modal-select);
      border-left: $xModal-line-width solid transparent;
      border-right: $xModal-line-width solid transparent;
      z-index: 1;
    }
  }
  @include name(null, focusin) {
    &:after {
      border-top: $xModal-line-width solid var(--x-modal-select-active);
    }
  }
}

@include namespace('xFront', true) {
  @include name {
    z-index: 1000;
  }
}
@include namespace('xOverlay', true) {
  @include name {
    background: #aaa;
    opacity: 0.15;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>