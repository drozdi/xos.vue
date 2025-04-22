<script>
import { computed, onMounted, provide, ref, reactive, h, nextTick, inject, getCurrentInstance, withDirectives, resolveDirective, vShow, onUnmounted, watch, isRef } from 'vue'
import { QBtn } from "quasar";
import { get, set, unset } from '../../utils/_'
import { isFunction, isArray, isEmpty, isEmptyObject } from '../../utils/is'
import xMarkupTable from '../markup-table/xMarkupTable'
import xColumn from './xColumn.vue'

function convertNodes (items) {
  return Object.entries(items).map(([index, item]) => {
    return reactive({
      data: item,
      index,
      expand: false,
      isParent: false,
      isChildren: false,
      nodes: []
    })
  })
}
function groupBy (items, key) {
  const result = {};
  nodes.forEach((node) => {
    if (node.data[key]) {
      if (!result[node.data[key]]) {
        result[node.data[key]] = []
      }
      result[node.data[key]].push(node)
    } else {
      result[node.index] = node
    }
  })
  return Object.values(result).map((val) => {
    if (isArray(val)) {
      val[0].nodes = val.slice(1).map((node) => {
        node.isChildren = true
        return node
      })
      val[0].isParent = !!val[0].nodes.length
      return val[0]
    }
    return val
  })
}
function sortBy (nodes, key, descending) {
  const fn = (a, b) => {
    a = a.data
    b = b.data
    if (a[key] > b[key]) {
      return descending? -1: 1
    }
    if (a[key] < b[key]) {
      return descending? 1: -1
    }
    return 0
  }
  nodes.sort(fn)
  return nodes.map((val) => {
    isArray(val.nodes) && val.nodes.sort(fn)
    return val
  })
}

const xJoinTable = {
  name: "xJoinTable",
  props: {
    editable: {
      type: [Boolean, Function],
      default: false
    },
    separate: Boolean,
    column: {
      type: xColumn,
      default: null
    },
    expand: {
      type: Boolean,
      default: false
    },
    groupAt: {
      type: String,
      default: 'begin',
      validate: (v) => ['begin', 'end'].includes(v)
    },
    sortKey: String,
    sortDesc: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => {}
    }
  },
  emits: ['update:modelValue'],
  components: { xMarkupTable, xColumn },
  setup (props, { emit, slots, expose }) {
    const items = computed({
      get: () => props.modelValue || {},
      set: (value) => emit('update:modelValue', value)
    })
    const state = reactive({
      level: 0,
      columns: [],
      isHeader: true
    })
    provide('__x_table', state)

    function editable (data, index) {
      return isFunction(props.editable)? props.editable(data, index): props.editable
    }

    const columns = computed(() => {
      return [...state.columns].sort((a, b) => {
        if (a.isGrouped) {
          return props.groupAt==='begin'? -1: 1
        }
        if (b.isGrouped) {
          return props.groupAt==='begin'? 1: -1
        }
        return 0
      })
    })
    const fields = computed(() => {
      let ret = [];
      (function recursive (columns) {
        for (let i = 0, cnt = columns.length; i < cnt; i++) {
          if (!columns[i].field && columns[i].isColumns) {
            recursive(columns[i].columns)
          } else {
            ret.push(columns[i])
          }
        }
      })(columns.value)
      return ret.filter((v) => v.field && (
          props.column?.isGrouped || v.field != props.column?.field
      ));
    })
    const rowspan = computed(() => {
      let max = 0;
      (function recursive (columns) {
        for (let i = 0; i < columns.length; i++) {
          max = max > columns[i].level? max: columns[i].level
          if (columns[i].isColumns) {
            recursive(columns[i].columns)
          }
        }
      })(columns.value)
      return max
    })
    const colspan = computed(() => {
      return columns.value.reduce((sum, column) => {
        return sum + (column.isGroup? 0: column.colspan)
      }, 0) || 1
    })

    const groupKey = computed(() => {
      for (let i = 0; i < fields.value.length; i++) {
        if (fields.value[i].isGrouped && !fields.value[i].isGroup) {
          return fields.value[i].field
        }
      }
      return null
    })
    const sort = ref({
      key: props.sortKey,
      descending: props.sortDesc
    })

    const nodes = computed(() => {
      let nodes = convertNodes(items.value)
      if (groupKey.value) {
        nodes = groupBy(nodes, groupKey.value)
      }
      if (sort.value.key) {
        nodes = sortBy(nodes, sort.value.key, sort.value.descending)
      }
      return nodes
    })

    function getSlot (slots, name) {
      return (slots.$slots || slots)[name]
    }
    function getAttr (attrs, name) {
      return (attrs.$attrs || attrs)[name] || undefined
    }
    function onSort (key) {
      if (sort.value.key === key) {
        if (sort.value.descending) {
          sort.value.descending = false
        } else {
          sort.value.key = null
          sort.value.descending = true
        }
      } else {
        sort.value.key = key
        sort.value.descending = true
      }
    }

    function genTHead () {
      let rows = [];
      (function recursive (columns, level) {
        rows[level] = (rows[level] || []).concat(columns.map((column) => {
          if (column.isColumns && column.isHeader) {
            recursive(column.columns, level + 1)
          } else if (column.isColumns) {
            return column.columns.map(genTHeadCell)
          }
          if (column.isGrouped) {
            return genTHeadCell(column)
          }
          if (column.isHeader && !column.isGroup) {
            return genTHeadCell(column)
          }
          return null;
        }).filter((cell) => cell));
      })(columns.value, 0);
      return rows.map((row) => {
        return h('tr', {
          role: 'row'
        }, row)
      })
    }
    function genTHeadCell (column) {
      if (column.isGrouped) {
        return genTHeadCellExpand(column)
      }
      return h('th', {
        colspan: column.colspan,
        //// ??????
        rowspan: (column.$table.isHeader? 1: rowspan.value),
        style: getAttr(column, 'style') || {},
        role: 'columnheader'
      },  [genTHeadCellSlot(column), column.sortable? genTHeadCellSort(column): ''])
    }
    function genTHeadCellSlot (column) {
      return getSlot(column, 'header')?.({column: column.$props }) || column.header
    }
    function genTHeadCellSort (column) {
      return h(QBtn, {
        iconRight: sort.value.key === column.field? (sort.value.descending? 'mdi-sort-descending': 'mdi-sort-ascending'): 'mdi-sort',
        flat: true,
        size: 'sm',
        class: 'q-ml-md',
        onClick: () => onSort(column.field)
      })
    }
    function genTHeadCellExpand (column) {
      return h('th', {
        colspan: column.colspan,
        //// ??????
        rowspan: (column.$table.isHeader? 1: rowspan.value),
        style: getAttr(column, 'style') || {
          width: '32px'
        },
        role: 'columnheader'
      })
    }

    function genTBody () {
      return nodes.value.map((node) => {
        if (props.column?.isGrouped) {
          return wrapShow(genTBodyRow(node), props.expand)
        }
        return genTBodyRow(node)
      })
    }
    function genTBodyRow (node) {
      let rows = [];
      let append = [];
      (function recursive (node, fields) {
        let row = []
        fields.forEach((column) => {
          if (column.isGroup) {
            append = genTBodyGroup(node, column)
            if (!column.isGrouped) return
          } else if (column.isGrouped && node.nodes) {
            append = genTBodyGrouped(node.nodes, node.expand)
          }
          row.push(genTBodyCell(node, column));
        })
        rows.push(h('tr', {
          role: 'row',
          class: 'x-table__item'
        }, row))
      })(node, fields.value)
      if (props.separate && append.length > 0) {
        append.push(genTBodyRowSeparate(node))
      }
      return rows.concat(append);
    }
    function genTBodyRowSeparate (node) {
      return wrapShow(h('tr', {
        class: 'x-table__item x-no-hover'
      }, h('td', {
        colspan: colspan.value,
        class: 'x-table__item-row'
      })), node.expand)
    }
    function genTBodyGrouped (nodes, expand) {
      return nodes.map((node) => {
        return wrapShow(genTBodyRow(node), expand)
      })
    }
    function genTBodyGroup (node, column) {
      if (!node.data[column.field]) {
        return []
      }
      return [h(xJoinTable, {
        ...props,
        column: column,
        sortKey: sort.value.key,
        sortDesc: sort.value.descending,
        expand: node.expand || false,
        modelValue: node.data[column.field]
      },() => getSlot(column, 'body')?.({
            field: column.field,
            header: column.header,
            data: node.data,
            index: node.index,
            expand: node.expand,
            isParent: node.isParent,
            isChildren: node.isChildren,
          }) || slots.default()
      )]
    }
    function genTBodyCell (node, column) {
      if (column.isGrouped && !isEmpty(node.nodes)) {
        return genTBodyCellExpand(node, column)
      } else if (column.isGrouped && column.isGroup && node.data[column.field]) {
        return genTBodyCellExpand(node, column)
      } else if (column.isGrouped) {
        return h('td')
      }
      return h('td', {
        role: 'cell',
        class: 'x-table__item-row',
        colspan: column.colspan
      }, [
        h('div', {class: 'x-table__item-title'}, getSlot(column, 'label')?.({column: column.$props, data: node.data }) || column.header),
        h('div', {class: 'x-table__item-value text-'+column.align}, (getSlot(column, editable(node.data, node.index) === true? 'editor': 'body') || getSlot(column,'body'))?.({
          field: column.field,
          header: column.header,
          colspan: column.colspan,
          data: node.data,
          index: node.index
        }) || node.data[column.field])
      ])
    }

    function genTBodyCellExpand (node, column) {
      return h('td', {
        role: 'cell',
        class: 'x-table__item-row',
        colspan: column.colspan
      }, [
        h('div', {class: 'x-table__item-value text-' + column.align}, (
            getSlot(column, editable(node.data, node.index) === true ? 'editor' : 'body') || getSlot(column, 'body'))?.({
          field: column.field,
          header: column.header,
          colspan: column.colspan,
          data: node.data,
          index: node.index
        }) || h(QBtn, {
          onClick: () => node.expand = !node.expand,
          color: "accent",
          round: true,
          dense: true,
          size: 'sm',
          icon: node.expand? 'remove': 'add'
        }))
      ])
    }

    function wrapShow (vnode, expand) {
      const show = isRef(expand)? expand.value: expand
      if (Array.isArray(vnode)) {
        return vnode.map((node) => withDirectives(node, [
          [vShow, show]
        ]))
      }
      return withDirectives(vnode, [
        [vShow, show]
      ])
    }

    if (props.column) {
      return (...args) => [slots.default(...args), genTBody()]
    }

    return () => h(xMarkupTable, {}, {
      default: (args) => [
        slots.default(args),
        h('thead', {role: 'rowgroup'}, genTHead()),
        h('tbody', {role: 'rowgroup'}, genTBody())
      ],
      header: (args) => [
        h('thead', {role: 'rowgroup'}, genTHead()),
      ]
    })
  }
}

export default xJoinTable;
</script>

<style scoped></style>