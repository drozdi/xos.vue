<template>
    <q-table
        class="bg-transparent"
        :grid="isMobile"
        :columns="computedHeaders"
        :hide-pagination="hidePagination"
        :rows="computedItems"
        :loading="loading"
        v-model:pagination="pagination"
        row-key="id"
        @request="onRequest"
        binary-state-sort
        flat wrap-cells>
      <template #item="props">
        <slot name="item" v-bind="{...props, isGrouped, isMobile, isChildren: false }">
          <x-col class="q-pa-xs grid-style-transition" :grid="{xs: 12, sm: 6, md: 4, lg: 3, xl: 2}">
            <q-card bordered flat>
              <q-list dense>
                <q-item v-if="isGrouped">
                  <q-item-section>
                    <q-item-label></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      <q-btn v-if="props.row._children && props.row._children.length>0" size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-for="col in props.cols.filter(col => !col.group)">
                  <q-item-section>
                    <q-item-label>{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <slot :name="'item-'+col.name" v-bind="{...props, isGrouped, isMobile, isChildren: false }">
                      <q-item-label>{{ col.value }}</q-item-label>
                    </slot>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
            <template v-if="props.row._children && props.row._children.length>0">
              <q-card v-for="sub in props.row._children" v-show="props.expand" bordered flat>
                <q-list dense>
                  <template v-for="col in props.colsMap">
                    <q-item v-if="!col.group">
                      <q-item-section>
                        <q-item-label>{{ col.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <slot :name="'item-'+col.name" v-bind="{...props, row: sub, isChildren: true}">
                          <q-item-label>{{ sub[col.field] }}</q-item-label>
                        </slot>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </q-card>
            </template>
          </x-col>
        </slot>
      </template>
      <template #body="props">
        <slot name="body" v-bind="{ ...props, isGrouped, isMobile, isChildren: false }">
          <q-tr :props="props">
            <q-td v-if="isGrouped">
              <q-btn v-if="props.row._children && props.row._children.length>0" size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
            </q-td>
            <template v-for="col in props.cols">
              <slot v-if="!col.group" :name="'body-cell-'+col.name" v-bind="{...props, isGrouped, isMobile, isChildren: false }">
                <q-td :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </slot>
            </template>
          </q-tr>
          <template v-if="props.row._children && props.row._children.length>0">
            <q-tr v-for="sub in props.row._children" v-show="props.expand">
              <q-td v-if="isGrouped"></q-td>
              <template v-for="col in props.colsMap">
                <slot v-if="!col.group" :name="'body-cell-'+col.name" v-bind="{ ...props, row: sub, isChildren: true }">
                  <q-td :key="col.name" :props="props">
                    {{ sub[col.field] }}
                  </q-td>
                </slot>
              </template>
            </q-tr>
            <q-tr no-hover v-show="props.expand">
              <q-td :colspan="props.cols.length" style="height: auto;" />
            </q-tr>
          </template>
        </slot>
      </template>
      <template v-for="slot in parentSlots" #[slot]="args">
        <slot :name="slot" v-bind="{...args, isGrouped, isMobile }" />
      </template>
    </q-table>
</template>

<script>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

import xCol from '../col/xCol'

import defTableProps from "./default"
import { makeTableProps } from "./props"
import { propsParent } from "../../utils/props";

import { provideTableProps } from "../../composables/provide";

import { useTable } from "../../composables/useTable";
import { useGrid } from "../../composables/useGrid";
import { injectSize } from "../../composables/useSize";

function groupBy (array, key) {
  const result = {};
  array.forEach(item => {
    if (item[key]) {
      if (!result[item[key]]) {
        result[item[key]] = []
      }
      result[item[key]].push(item)
    } else {
      result[item.id] = item
    }
  });
  return Object.values(result).map((val) => {
    if (Array.isArray(val)) {
      return {
        ...val[0],
        _children: val.slice(1)
      }
    }
    return val
  })
}
function sortBy (array, key, descending) {
  let result = [...array];
  const fn = (a, b) => {
    if (Array.isArray(a)) {
      let a = a[0]
    }
    if (Array.isArray(b)) {
      let b = b[0]
    }
    if (a[key] > b[key]) {
      return descending? -1: 1
    }
    if (a[key] < b[key]) {
      return descending? 1: -1
    }
    return 0
  }
  result.sort(fn)
  return result.map((val) => {
    Array.isArray(val._children) && val._children.sort(fn)
    return val
  })
}

export default {
  name: "x-table",
  props: {
    ...propsParent(makeTableProps, provideTableProps, defTableProps),
    loading: {
      type: Boolean,
      default: false
    }
  },
  components: { xCol },
  setup (props, { emit, slots }) {
    const $size = injectSize(useQuasar().screen)
    const { items, pagination, rowsPerPageOptions, pagesNumber, isGrouped } = useTable()

    const computedHeaders = computed(() => {
      let headers = [...props.headers]
      if (isGrouped.value) {
        headers.unshift(...props.groups)
      }
      return headers
    })

    const computedItems = computed(() => {
      if (props.groups.length === 0) {
        return items.value
      }
      let groupKey = props.groups[0].group
      const { sortBy, descending } = pagination.value
      let result = groupBy(items.value, groupKey)
      if (sortBy) {
        result = sortBy(result, sortBy, descending)
      }
      return result
    })

    const parentSlots = computed(() => {
      return Object.keys(slots).filter((slot) => {
        return !['body', 'item'].includes(slot)
      })
    })

    const isMobile = computed(() => {
      if (null === props.mobile) {
        return false;
      } else if (0 === props.mobile) {
        return true;
      }
      return $size.width < props.mobile
    })

    function onRequest (props) {
      const { sortBy, descending } = props.pagination
      pagination.value = {
        ...pagination.value,
        sortBy, descending
      }
    }

    return {
      items, pagination, pagesNumber, isGrouped, isMobile, parentSlots, computedItems, computedHeaders, rowsPerPageOptions, onRequest
    }
  }
}
</script>

<style lang="scss">

</style>