<script>
import { computed, h, ref } from "vue";
import { useQuasar } from "quasar";
import { isBoolean, isNumber, isObject } from '../../utils/is'
import props from './props';
import xRow from '../row/xRow'
import {injectSize} from "../../composables/useSize";
import { useGridSize } from "../../composables/useGrid";

export default {
  name: "xMarkupTable",
  props: {
    dense: Boolean,
    flat: Boolean,
    bordered: Boolean,
    square: Boolean,
    wrapCells: Boolean,
    gridHeader: Boolean,
    showHead: Boolean,
    showTitle: Boolean,
    grid: {
      type: [Boolean, Number, Object],
      default: false,
      validator: v => isBoolean(v) || isNumber(v) || isObject(v)
    },
    separator: {
      type: String,
      default: 'horizontal',
      validator: v => ['horizontal', 'vertical', 'cell', 'none'].includes(v)
    }
  },
  setup (props, { slots }) {
    const size = isObject(props.grid)? useGridSize(props.grid): ref(props.grid)
    const classes = computed(() =>
        'x-markup-table x-table__container x-table__card'
        + ` x-table--${ props.separator }-separator`
        + (props.dense === true ? ' x-table--dense' : '')
        + (props.flat === true ? ' x-table--flat' : '')
        + (props.bordered === true ? ' x-table--bordered' : '')
        + (props.square === true ? ' x-table--square' : '')
        + (props.wrapCells === false ? ' x-table--no-wrap' : '')
        + (props.grid !== false? ' x-table--grid': '')
        + (props.grid !== false && props.gridHeader === true? ' x-table--grid-header': '')
        + (props.grid !== false && props.showTitle === true? ' x-table--show-title' : '')
        + (props.grid !== false && isNumber(size.value)? ` x-table--grid-${size.value}`: '')
    )
    const args = computed(() => ({
      isGrid: props.grid !== false,
      isGridHeader: props.grid !== false && props.gridHeader === true,
      isShowTitle: props.grid !== false && props.showTitle === true
    }))
    return () => h('div', {
      class: classes.value
    }, [
      slots.header && args.value.isGridHeader? h('table', { class: 'x-table__header'}, slots.header(args.value)): '',
      h('table', { class: 'x-table' }, slots.default(args.value))
    ])
  }
}
</script>

<style lang="scss">
@import "../../scss/tools/namespace";
@import "../../styles/quasar.variables";

$shadow-color                   : #000 !default;
$dark-shadow-color              : #fff !default;
$elevation-umbra                : rgba($shadow-color, .2) !default;
$elevation-penumbra             : rgba($shadow-color, .14) !default;
$elevation-ambient              : rgba($shadow-color, .12) !default;
$elevation-dark-umbra           : rgba($dark-shadow-color, .2) !default;
$elevation-dark-penumbra        : rgba($dark-shadow-color, .14) !default;
$elevation-dark-ambient         : rgba($dark-shadow-color, .12) !default;
$shadow-2                       : 0 1px 5px $elevation-umbra,
                                  0 2px 2px $elevation-penumbra,
                                  0 3px 1px -2px $elevation-ambient !default;
$dark-shadow-2                  : 0 1px 5px $elevation-dark-umbra,
                                  0 2px 2px $elevation-dark-penumbra,
                                  0 3px 1px -2px $elevation-dark-ambient !default;
$table-border-radius            : 4px !default;
$table-border-color             : $separator-color !default;
$table-hover-background         : rgba(0, 0, 0, .03) !default;
$table-selected-background      : rgba(0, 0, 0, .06) !default;
$table-dark-border-color        : $separator-dark-color !default;
$table-dark-hover-background    : rgba(255, 255, 255, .07) !default;
$table-dark-selected-background : rgba(255, 255, 255, .1) !default;
$table-box-shadow               : $shadow-2 !default;
$table-box-shadow-dark          : $dark-shadow-2 !default;

$grid-cols                      : 6 !default;


@include namespace('@xTable', true) {
  @include name(container) {
    --x-table-border: #{$table-border-color};
    --x-table-box-shadow: #{$table-box-shadow};
    --x-table-hover-bg: #{$table-hover-background};
    --x-table-selected-bg: #{$table-selected-background};
  }
  .body--dark {
    @include name(container) {
      --x-table-border: #{$table-dark-border-color};
      --x-table-box-shadow: #{$table-box-shadow-dark};
      --x-table-hover-bg: #{$table-dark-hover-background};
      --x-table-selected-bg: #{$table-dark-selected-background};
    }
  }
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    th {
      font-weight: 500;
      font-size: 12px;
      user-select: none;
    }
    th, td {
      padding: 7px 16px;
      background-color: inherit;
    }
    thead, td, th {
      border-style: solid;
      border-width: 0;
    }
    > tbody  td {
      position: relative;
      font-size: 13px;
      &:before, &:after {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
      }
      &:before {
        background: var(--x-table-hover-bg)
      }
      &:after {
        background: var(--x-table-selected-bg)
      }
    }
    > thead, tr, th, td {
      border-color: var(--x-table-border)
    }
    > tbody > tr:not(.x-no-hover):hover > td:not(.x-no-hover):before {
      content: ''
    }
  }

  @include name(title) {
    font-size: 20px;
    letter-spacing: .005em;
    font-weight: 400;
  }
  @include name(container) {
    position: relative;
    box-shadow: var(--x-table-box-shadow);
    > *:first-child {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }
    > *:last-child {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
    }
  }
  @include name(item-title) {
    display: none;
  }
  @include name(null, no-wrap) {
    th, td {
      white-space: nowrap
    }
  }
  @include name(null, bordered) {
    border: 1px solid var(--x-table-border);
  }
  @include name(null, dense) {
    th, td {
      padding: 4px 8px;
      &:first-child {
        padding-left: 16px;
      }
      &:last-child {
        padding-right: 16px
      }
    }
  }
  @include name(null, horizontal-separator cell-separator) {
    thead th, tbody tr:not(:last-child) > td {
      border-bottom-width: 1px
    }
  }
  @include name(null, vertical-separator cell-separator) {
    td, th {
      border-left-width: 1px
    }
    thead tr:last-child th,
    &#{name(null, 'loading')} tr:nth-last-child(2) th {
      border-bottom-width: 1px
    }
    td:first-child, th:first-child {
      border-left: 0
    }
    @include name(top) {
      border-bottom: 1px solid var(--x-table-border)
    }
  }
  @include name(null, grid) {
    box-shadow: none;
    &:not(#{name(null, grid-header)}) {
      > {
        @include name(header) {
          > thead {
            display: none;
          }
        }
      }
    }
    > { @include name {
      > thead {
        display: none;
      }
    } }
    > table > tbody {
      display: flex;
      flex-wrap: wrap;
    }
    @include name(item) {
      flex: 10000 1 0%;
      display: flex;
      flex-direction: column;
      border-radius: $table-border-radius;
      padding: 16px;
      position: relative;
      &:before {
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        content: '';
        border-radius: inherit;
        border: 1px solid var(--x-table-border);
        box-shadow: var(--x-table-box-shadow);
        z-index: -1;
      }
    }
    @include name(item-row) {
      & + {@include name(item-row) {
        margin-top: 8px
      }}
      border-bottom-width: 0 !important;
      border-left-width: 0 !important;
      &:before {
        display: none;
      }
      &:hover {
        &:before {
          display: block;
        }
      }
    }
    @include name(item-title) {
      opacity: .54;
      font-weight: 500;
      font-size: 12px;
    }
    @include name(item-value) {
      font-size: 13px;
    }
  }
  @include name(null, show-title) {
    @include name(item-title) {
      display: block;
    }
  }

  @include name(null, square) {
    border-radius: 0;
    @include name(item) {
      border-radius: 0;
    }
  }
  @include name(null, flat) {
    box-shadow: none;
    @include name(item) {
      &:before {
        box-shadow: none;
      }
    }
  }
  @for $index from 1 through $grid-cols {
    @include name(null, grid-#{$index}) {
      > table > tbody > {
        @include name(item) {
          flex: 0 1 percentage(1/$index);
          width: percentage(1/$index);
        }
      }
    }
  }
}
</style>