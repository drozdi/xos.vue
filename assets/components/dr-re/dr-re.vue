<template>
  <div ref="root" :style="style" :class="classes"
       @mousedown.stop="elementMouseDown($event)"
       @touchstart.stop="elementTouchDown($event)">
    <slot name="default"></slot>
    <template v-if="resizable">
      <div v-for="handle in handles" :key="handle"
           :class="[dragCancel.replace(/^\./g, ''), classNameHandle, classNameHandle + '-' + handle]"
           @mousedown.stop.prevent="handleMouseDown($event, handle)"
           @touchstart.stop.prevent="handleTouchDown($event, handle)">
      </div>
    </template>
  </div>
</template>

<script>
import { getComputedSize, matchesSelectorToParentElements, addEvent, removeEvent } from '../../utils/dom';
import { minMax, isString } from "../../utils/fns";
import { reactive, ref, computed, onBeforeMount, onMounted, onUnmounted, watch, provide, inject, getCurrentInstance } from 'vue';

import { provideApp, provideAppSize, provideDRProps } from "../../composables/provide"
import { parentProps, propsParent } from '../../utils/props'
import defDRProps from './default'
import { makeDRProps } from './props'

import { injectApp, useApp } from "../../composables/useApp";
import { useSize } from "../../composables/useSize";
import { useAccess } from "../../composables/useAccess";
import { useSetting } from "../../composables/useSetting";
import { useI18n } from "../../composables/useI18n";

const events = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup',
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend',
  },
}
const userSelectNone = {
  userSelect: 'none',
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  MsUserSelect: 'none',
}
const userSelectAuto = {
  userSelect: 'auto',
  MozUserSelect: 'auto',
  WebkitUserSelect: 'auto',
  MsUserSelect: 'auto',
}
const changeHandle = {
  e (rect, dx) {
    return {
      w: rect.w + dx
    }
  },
  w (rect, dx) {
    return {
      x: rect.x + dx,
      w: rect.w - dx
    }
  },
  n (rect, dx, dy) {
    return {
      y: rect.y + dy,
      h: rect.h - dy
    }
  },
  s (rect, dx, dy) {
    return {
      h: rect.h + dy
    }
  },
  se (rect, dx, dy) {
    return Object.assign(
        changeHandle.s(rect, dx, dy),
        changeHandle.e(rect, dx, dy)
    )
  },
  sw (rect, dx, dy) {
    return Object.assign(
        changeHandle.s(rect, dx, dy),
        changeHandle.w(rect, dx, dy)
    )
  },
  ne (rect, dx, dy) {
    return Object.assign(
        changeHandle.n(rect, dx, dy),
        changeHandle.e(rect, dx, dy)
    )
  },
  nw (rect, dx, dy) {
    return Object.assign(
        changeHandle.n(rect, dx, dy),
        changeHandle.w(rect, dx, dy)
    )
  }
}

export default {
  name: "dr-re",
  props: {
    ...parentProps(makeDRProps, defDRProps, provideDRProps),
    className: {
      type: String,
      default: 'dr'
    },
    classNameDraggable: {
      type: String,
      default: 'draggable'
    },
    classNameResizable: {
      type: String,
      default: 'resizable'
    },
    classNameDragging: {
      type: String,
      default: 'dragging'
    },
    classNameResizing: {
      type: String,
      default: 'resizing'
    },
    classNameActive: {
      type: String,
      default: 'active'
    },
    classNameHandle: {
      type: String,
      default: 'handle'
    },
    dragHandle: {
      type: String,
      default: null
    },
    dragCancel: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:x',
    'update:y',
    'update:w',
    'update:h',
    'update:z',
    'update:active',
    'activated',
    'deactivated',
    'resize',
    'drag'
  ],
  setup (props, { emit }) {
    const $app = injectApp(null)
    const $size = useSize(props.w, props.h)

    function __emit (...args) {
      emit(...args)
      $app?.emit(...args)
    }

    const root = ref(null)
    const parent = ref(document.querySelector(props.parent))
    const resizing = ref(false)
    const dragging = ref(false)
    const aspectFactor = ref(null)

    const width = computed({
      get () {
        return $size.width
      },
      set (value) {
        emit('update:w', value)
        $size.width = value
      },
    })
    const height = computed({
      get() {
        return $size.height
      },
      set(value) {
        emit('update:h', value)
        $size.height = value
      },
    })
    const left = computed({
      get () {
        return $size.left
      },
      set (value) {
        emit('update:x', value)
        $size.left = value
      },
    })
    const top = computed({
      get () {
        return $size.top
      },
      set (value) {
        emit('update:y', value)
        $size.top = value
      },
    })
    const active = computed({
      get () {
        return props.active || $size.active
      },
      set (value) {
        emit('update:active', value)
        $size.active = value
      },
    })

    const computedWidth = computed(() => {
      if (null == width.value) {
        return ''
      }
      if ('auto' === width.value) {
        return 'auto'
      }
      return width.value + 'px'
    })
    const computedHeight = computed(() => {
      if (null == height.value) {
        return ''
      }
      if ('auto' === height.value) {
        return 'auto'
      }
      return height.value + 'px'
    })
    const computedTop = computed(() => {
      if (null == top.value) {
        return ''
      }
      if ('auto' === top.value) {
        return 'auto'
      }
      return top.value + 'px'
    })
    const computedLeft = computed(() => {
      if (null == left.value) {
        return ''
      }
      if ('auto' === left.value) {
        return 'auto'
      }
      return left.value + 'px'
    })
    const style = computed(() => {
      return {
        //transform: `translate(${left.value}px, ${top.value}px)`,
        width: computedWidth.value,
        height: computedHeight.value,
        top: computedTop.value,
        left: computedLeft.value,
        zIndex: props.z,
        ...(dragging.value && props.disableUserSelect
            ? userSelectNone
            : userSelectAuto),
      }
    })
    const classes = computed(() => {
      return [{
        [props.classNameActive]: active.value,
        [props.classNameDragging]: dragging.value,
        [props.classNameResizing]: resizing.value,
        [props.classNameDraggable]: props.draggable,
        [props.classNameResizable]: props.resizable
      }, props.className]
    })
    const limits = computed(() => {
      if (_limits) {
        return _limits;
      }
      let style = getComputedStyle(root.value);
      let minWidth = parseFloat(style.getPropertyValue('min-width'), 10);
      let maxWidth = parseFloat(style.getPropertyValue('max-width'), 10);
      let minHeight = parseFloat(style.getPropertyValue('min-height'), 10);
      let maxHeight = parseFloat(style.getPropertyValue('max-height'), 10);

      let minW, maxW, minH, maxH;
      minW = minWidth = props.minWidth? props.minWidth: minWidth;
      maxW = maxWidth = props.maxWidth? props.maxWidth: maxWidth;
      minH = minHeight = props.minHeight? props.minHeight: minHeight;
      maxH = maxHeight = props.maxHeight? props.maxHeight: maxHeight;

      if (props.lockAspectRatio) {
        if (minHeight > 0 && minWidth / minHeight > aspectFactor.value) {
          minHeight = minWidth / aspectFactor.value;
        } else if (minHeight > 0) {
          minWidth = minHeight * aspectFactor.value;
        }
        if (maxHeight > 0 && maxWidth / maxHeight > aspectFactor.value) {
          maxHeight = maxWidth / aspectFactor.value;
        } else if (maxHeight > 0) {
          maxWidth = maxHeight * aspectFactor.value;
        }
        if (minWidth != minW) {
          minWidth = Math.min(minWidth, minW);
          minHeight = minWidth / aspectFactor.value;
        }
        if (maxWidth != maxW) {
          maxWidth = Math.min(maxWidth, maxW);
          maxHeight = maxWidth / aspectFactor.value;
        }
        if (minHeight != minW) {
          minHeight = Math.min(minHeight, minH);
          minWidth = minHeight * aspectFactor.value;
        }
        if (maxHeight != maxH) {
          maxHeight = Math.min(maxHeight, maxH);
          maxWidth = maxHeight * aspectFactor.value;
        }
      }
      return _limits = {
        minWidth: minWidth,
        maxWidth: maxWidth,
        minHeight: minHeight,
        maxHeight: maxHeight
      };
    })

    let _limits = null
    let eventsFor = events.mouse
    let startPosition = {
      pageX: 0,
      pageY: 0,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      handle: null
    }

    const elementTouchDown = (event) => {
      eventsFor = events.touch
      elementDown(event)
    }
    const elementMouseDown = (event) => {
      eventsFor = events.mouse
      elementDown(event)
    }

    const elementDown = (event) => {
      if (event instanceof MouseEvent && event.which !== 1) {
        return
      }
      if (!props.draggable) {
        return;
      }
      event = event.touches ? event.touches[0] : event;
      const target = event.target || event.srcElement
      if (
          (props.dragHandle &&
              !matchesSelectorToParentElements(target, props.dragHandle, root.value)) ||
          (props.dragCancel &&
              matchesSelectorToParentElements(target, props.dragCancel, root.value)) ||
          (props.classNameHandle &&
              matchesSelectorToParentElements(target, props.classNameHandle, root.value))
      ) {
        return
      }
      if (!active.value) {
        active.value = true
        __emit('activated');
      }
      dragging.value = true;
      startPosition = {
        pageX: event.pageX,
        pageY: event.pageY,
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value
      }
      emit('drag', {
        t: 'start',
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value
      });

      addEvent(document.documentElement, eventsFor.move, elementMove)
      addEvent(document.documentElement, eventsFor.stop, elementUp)
    }
    const elementMove = (event) => {
      if (!dragging.value) {
        return;
      }
      event = event.touches ? event.touches[0] : event;
      let moveX = event.pageX - startPosition.pageX;
      let moveY = event.pageY - startPosition.pageY;
      if (Math.abs(moveX) < 1 && Math.abs(moveY) < 1) {
        return;
      }
      moveX += startPosition.x;
      moveY += startPosition.y;
      top.value = moveY;
      left.value = moveX;
      emit('drag', {
        t: 'move',
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value
      });
    }
    const elementUp = () => {
      removeEvent(document.documentElement, eventsFor.move, elementMove)
      removeEvent(document.documentElement, eventsFor.stop, elementUp)
      dragging.value = false
      emit('drag', {
        t: 'stop',
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value
      });
    }

    const handleMouseDown = (event, handle) => {
      eventsFor = events.mouse;
      handleDown(event, handle);
    }
    const handleTouchDown = (event, handle) => {
      eventsFor = events.touch;
      handleDown(event, handle);
    }

    const handleDown = (event, handle) => {
      if (event instanceof MouseEvent && 1 !== event.which) {
        return;
      }
      if (!props.resizable) {
        return;
      }
      event = event.touches ? event.touches[0] : event;
      if (event.stopPropagation) {
        event.stopPropagation()
      }
      resizing.value = true;
      startPosition = {
        pageX: event.pageX,
        pageY: event.pageY,
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value,
        handle: handle
      }

      if (!active.value) {
        active.value = true
        __emit('activated');
      }

      emit('resize', {
        t: 'start',
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value,
        handle: handle
      });
      addEvent(document.documentElement, eventsFor.move, handleMove)
      addEvent(document.documentElement, eventsFor.stop, handleUp)
    }
    const handleMove = (event) => {
      event = event.touches? event.touches[0]: event;
      let moveX = event.pageX - startPosition.pageX;
      let moveY = event.pageY - startPosition.pageY;
      if (Math.abs(moveX) < 1 && Math.abs(moveY) < 1) {
        return;
      }
      let p = changeHandle[startPosition.handle](startPosition, moveX, moveY);
      let leftPx = p.x || left.value,
          topPx = p.y || top.value,
          widthPx = p.w || width.value,
          heightPx = p.h || height.value;
      if (props.lockAspectRatio && (startPosition.handle === 'e' || startPosition.handle === 'w')) {
        heightPx = widthPx / aspectFactor.value;
      } else if (props.lockAspectRatio && (startPosition.handle === 's' || startPosition.handle === 'n')) {
        widthPx = heightPx * aspectFactor.value;
      } else if (props.lockAspectRatio) {
        if (widthPx / heightPx > aspectFactor.value) {
          heightPx = widthPx / aspectFactor.value;
        } else {
          widthPx = heightPx * aspectFactor.value;
        }
      }
      let nWidth = minMax(widthPx, limits.value.minWidth, limits.value.maxWidth);
      let nHeight = minMax(heightPx, limits.value.minHeight, limits.value.maxHeight);
      //left = left - (width - nWidth < 0? width - nWidth: 0);
      //top = top - (height - nHeight < 0? height - nHeight: 0);
      widthPx = nWidth;
      heightPx = nHeight;
      left.value = leftPx;
      top.value = topPx;
      width.value = widthPx;
      height.value = heightPx;
      emit('resize', {
        t: 'move',
        w: widthPx,
        h: heightPx,
        x: leftPx,
        y: topPx,
        handle: startPosition.handle
      });
      resizing.value = true
    }
    const handleUp = () => {
      removeEvent(document.documentElement, eventsFor.move, handleMove)
      removeEvent(document.documentElement, eventsFor.stop, handleUp)
      resizing.value = false
      emit('resize', {
        t: 'stop',
        w: width.value,
        h: height.value,
        x: left.value,
        y: top.value,
        handle: startPosition.handle
      });
    }

    const deselect = (event) => {
      const target = event.target || event.srcElement;
      if (root && root.value && !root.value.contains(target)) {
        if (active.value) {
          active.value = false;
          __emit('deactivated');
        }
      }
    }

    const select = (event) => {
      if (!active.value) {
        active.value = true;
        __emit('activated');
      }
    }

    const moveHorizontally = (val) => {
      if (val === 'center') {
        //const [pWidth] = getComputedSize(root.value.parentNode);
        const [pWidth] = getComputedSize(parent.value);
        val = (pWidth-width.value)/2;
      } else if (val === 'right') {
        //const [pWidth] = getComputedSize(root.value.parentNode);
        const [pWidth] = getComputedSize(parent.value);
        val = (pWidth-width.value);
      } else if (val === 'left') {
        val = 0;
      }
      left.value = val;
    }
    const moveVertically = (val) => {
      if (val === 'center') {
        //const [, pHeight] = getComputedSize(root.value.parentNode);
        const [, pHeight] = getComputedSize(parent.value);
        val = (pHeight-height.value)/2;
      } else if (val === 'bottom') {
        //const [, pHeight] = getComputedSize(root.value.parentNode);
        const [, pHeight] = getComputedSize(parent.value);
        val = (pHeight-height.value);
      } else if (val === 'top') {
        val = 0;
      }
      top.value = val;
    }

    const changeWidth = (val) => {
      if (!val) {
        return;
      }
      if (isString(val) && val.substr(-1) === '%') {
        val = Math.ceil(getComputedSize(parent.value)[0]*parseInt(val, 10)/100)
      }
      width.value = minMax(val, limits.value.minWidth, limits.value.maxWidth);
      if (props.lockAspectRatio) {
        height.value = width.value * aspectFactor.value;
      }
    }
    const changeHeight = (val) => {
      if (!val) {
        return;
      }
      if (isString(val) && val.substr(-1) === '%') {
        val = Math.ceil(getComputedSize(parent.value)[1]*parseInt(val, 10)/100)
      }
      height.value = minMax(val, limits.value.minHeight, limits.value.maxHeight);
      if (props.lockAspectRatio) {
        width.value = height.value / aspectFactor.value;
      }
    }

    onUnmounted(watch(() => props.w,(val) => {
      if (resizing.value || dragging.value) {
        return
      }
      changeWidth(val)
    }))
    onUnmounted(watch(() => props.h,(val) => {
      if (resizing.value || dragging.value) {
        return
      }
      changeHeight(val)
    }))
    onUnmounted(watch(() => props.lockAspectRatio, (val) => {
      if (val) {
        aspectFactor.value = width.value / height.value
      } else {
        aspectFactor.value = undefined
      }
    }))
    onUnmounted(watch(() => props.x,(val) => {
      if (resizing.value || dragging.value) {
        return
      }
      moveHorizontally(val)
    }))
    onUnmounted(watch(() => props.y,(val) => {
      if (resizing.value || dragging.value) {
        return
      }
      moveVertically(val)
    }))

    onMounted(() => {
      //root.value = getCurrentInstance().ctx.$el
      const [widthPx, heightPx] = getComputedSize(root.value)
      if (props.w > -1 && props.h > -1) {
        aspectFactor.value = props.w / props.h;
      } else {
        aspectFactor.value =
            (width.value !== 'auto' ? width.value : widthPx) /
            (height.value !== 'auto' ? height.value : heightPx)
      }
      width.value = width.value !== 'auto' ? width.value : widthPx
      height.value = height.value !== 'auto' ? height.value : heightPx
      props.w != 'auto' && changeWidth(props.w);
      props.h != 'auto' && changeHeight(props.h);
      moveHorizontally(props.x);
      moveVertically(props.y);

      if (props.active) {
        __emit('activated')
      }

      addEvent(root.value, 'click', select);
      addEvent(document.documentElement, 'mousedown', deselect);
      addEvent(document.documentElement, 'touchend touchcancel', deselect);
    })
    onBeforeMount(() => {
      if (props.maxWidth && props.minWidth > props.maxWidth) {
        console.warn('[Vdr warn]: Invalid prop: minWidth cannot be greater than maxWidth')
      }
      if (props.maxHeight && props.minHeight > props.maxHeight) {
        console.warn('[Vdr warn]: Invalid prop: minHeight cannot be greater than maxHeight')
      }
    })
    onUnmounted(() => {
      addEvent(document.documentElement, 'mousedown', deselect);
      addEvent(document.documentElement, 'touchend touchcancel', deselect);
    })

    return {
      style, classes, root,
      elementTouchDown,
      elementMouseDown,
      handleMouseDown,
      handleTouchDown
    }
  }
}
</script>