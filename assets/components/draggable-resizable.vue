<template>
  <div ref="el" :style="style"
       :class="[{
          [classNameActive]: active,
          [classNameDragging]: dragging,
          [classNameResizing]: resizing,
          [classNameDraggable]: draggable,
          [classNameResizable]: resizable
        }, className]"
       @mousedown.stop="elementMouseDown($event)"
       @touchstart.stop="elementTouchDown($event)">
    <slot></slot>
    <template v-if="resizable">
      <div v-for="handle in handles" :key="handle"
           :class="[dragCancel.replace(/^\./g, ''), classNameHandle, classNameHandle + '-' + handle]"
           @mousedown.stop.prevent="handleMouseDown($event, handle)"
           @touchstart.stop.prevent="handleTouchDown($event, handle)">
      </div>
    </template>
  </div>
</template>

<script setup>
import { getComputedSize, matchesSelectorToParentElements, addEvent, removeEvent } from '../utils/dom';
import { minMax } from "../utils/fns";
import { reactive, ref, computed, onBeforeMount, onMounted, onUnmounted, watch, defineEmits, defineProps, provide, inject, getCurrentInstance } from 'vue';

import { dr as provideDr, modal as provideModal, drProps } from "../composables/provide"
import parentProps from '../utils/props-parent'
import { makeDRProps, defDRProps } from './dr-re/props'

let changeHandle = {
  e: function (event, dx) {
    return {
      w: startPosition.w + dx
    };
  },
  w: function (event, dx) {
    return {
      x: startPosition.x + dx,
      w: startPosition.w - dx
    };
  },
  n: function (event, dx, dy) {
    return {
      y: startPosition.y + dy,
      h: startPosition.h - dy
    };
  },
  s: function (event, dx, dy) {
    return {
      h: startPosition.h + dy
    };
  },
  se: function (event, dx, dy) {
    return Object.assign(
        changeHandle.s(event, dx, dy),
        changeHandle.e(event, dx, dy)
    );
  },
  sw: function (event, dx, dy) {
    return Object.assign(
        changeHandle.s(event, dx, dy),
        changeHandle.w( event, dx, dy)
    );
  },
  ne: function (event, dx, dy) {
    return Object.assign(
        changeHandle.n(event, dx, dy),
        changeHandle.e(event, dx, dy)
    );
  },
  nw: function (event, dx, dy) {
    return Object.assign(
        changeHandle.n(event, dx, dy),
        changeHandle.w(event, dx, dy)
    );
  }
};
let startPosition = {
  pageX: 0,
  pageY: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  handle: null
}
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
let eventsFor = events.mouse

const props = defineProps({
  ...parentProps(makeDRProps, defDRProps, provideModal),
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
  handles: {
    type: Array,
    default: function () {
      return ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
    },
    validator: function (val) {
      const s = ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
      return val.filter(function (val) {
        return s.indexOf(val) > -1;
      }).length === val.length;
    }
  },

  minWidth: {
    type: Number,
    default: 0,
    validator: function (val) {
      return val >= 0;
    }
  },
  minHeight: {
    type: Number,
    default: 0,
    validator: function (val) {
      return val >= 0;
    }
  },
  maxWidth: {
    type: Number,
    default: null,
    validator: function (val) {
      return val >= 0;
    }
  },
  maxHeight: {
    type: Number,
    default: null,
    validator: function (val) {
      return val >= 0;
    }
  },
  lockAspectRatio: {
    type: Boolean,
    default: false
  },
  disableUserSelect: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits([
  'update:x',
  'update:y',
  'update:w',
  'update:h',
  'update:z',
  'update:active',
  'mount',
  'destroy',
  'activated',
  'deactivated',
  'resize',
  'drag'
])

const el = ref(null)
const parent = ref(document.querySelector(props.parent));
const noProps = inject(drProps, ref({ h: 'auto', w: 'auto', active: false, x: 0, y: 0 }))

const width = computed({
  get () {
    return noProps.value.w
  },
  set (value) {
    emit('update:w', value)
    noProps.value.w = value
  },
})
const height = computed({
  get() {
    return  noProps.value.h
  },
  set(value) {
    emit('update:h', value)
    noProps.value.h = value
  },
})
const left = computed({
  get () {
    return noProps.value.x
  },
  set (value) {
    emit('update:x', value)
    noProps.value.x = value
  },
})
const top = computed({
  get () {
    return noProps.value.y
  },
  set (value) {
    emit('update:y', value)
    noProps.value.y = value
  },
})
const active = computed({
  get () {
    return props.active || noProps.value.active
  },
  set (value) {
    emit('update:active', value)
    noProps.value.active = value
  },
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

let _limits = null
const limits = computed(() => {
  if (_limits) {
    return _limits;
  }
  let style = getComputedStyle(el.value);
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

const resizing = ref(false)
const dragging = ref(false)
const aspectFactor = ref(null)

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
          !matchesSelectorToParentElements(target, props.dragHandle, el.value)) ||
      (props.dragCancel &&
          matchesSelectorToParentElements(target, props.dragCancel, el.value)) ||
      (props.classNameHandle &&
          matchesSelectorToParentElements(target, props.classNameHandle, el.value))
  ) {
    return
  }
  if (!active.value) {
    active.value = true
    emit('activated');
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
    emit('activated');
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
  let p = changeHandle[startPosition.handle](event, moveX, moveY);
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
  if (el && el.value && !el.value.contains(target)) {
    if (active.value) {
      active.value = false;
      emit('deactivated');
    }
  }
}

const moveHorizontally = (val) => {
  if (val === 'center') {
    //const [pWidth] = getComputedSize(el.value.parentNode);
    const [pWidth] = getComputedSize(parent.value);
    val = (pWidth-width.value)/2;
  } else if (val === 'right') {
    //const [pWidth] = getComputedSize(el.value.parentNode);
    const [pWidth] = getComputedSize(parent.value);
    val = (pWidth-width.value);
  } else if (val === 'left') {
    val = 0;
  }
  left.value = val;
}
const moveVertically = (val) => {
  if (val === 'center') {
    //const [, pHeight] = getComputedSize(el.value.parentNode);
    const [, pHeight] = getComputedSize(parent.value);
    val = (pHeight-height.value)/2;
  } else if (val === 'bottom') {
    //const [, pHeight] = getComputedSize(el.value.parentNode);
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
  width.value = minMax(val, limits.value.minWidth, limits.value.maxWidth);
  if (props.lockAspectRatio) {
    height.value = width.value * aspectFactor.value;
  }
}
const changeHeight = (val) => {
  if (!val) {
    return;
  }
  height.value = minMax(val, limits.value.minHeight, limits.value.maxHeight);
  if (props.lockAspectRatio) {
    width.value = height.value / aspectFactor.value;
  }
}

provide(provideDr, reactive({
  top: top,
  left: left,
  width: width,
  height: height,
  active: active
}))

onMounted(() => {
  const [widthPx, heightPx] = getComputedSize(el.value)
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

  emit('mount')
  if (active.value) {
    emit('activated')
  }

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
  emit('destroy')
  addEvent(document.documentElement, 'mousedown', deselect);
  addEvent(document.documentElement, 'touchend touchcancel', deselect);
})
watch(
    () => props.w,
    (val) => {
      /*if (resizing.value || dragging.value) {
        return
      }*/
      changeWidth(val)
    },
)
watch(
    () => props.h,
    (val) => {
      /*if ((resizing.value || dragging.value) {
        return
      }*/
      changeHeight(val)
    },
)
watch(
    () => props.lockAspectRatio,
    (val) => {
      if (val) {
        aspectFactor.value = width.value / height.value
      } else {
        aspectFactor.value = undefined
      }
    },
)
watch(
    () => props.x,
    (val) => {
      if (resizing.value || dragging.value) {
        return
      }
      moveHorizontally(val)
    }
)
watch(
    () => props.y,
    (val) => {
      if (resizing.value || dragging.value) {
        return
      }
      moveVertically(val)
    }
)
</script>>