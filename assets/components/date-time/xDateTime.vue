<template>
  <q-input v-model="value" :mask="computedMask" clearable>
    <template v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="value" :mask="mask" :readonly="$attrs.readonly">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
    <template v-slot:append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time v-model="value" :mask="mask" format24h :readonly="$attrs.readonly">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
export default {
  inheritAttrs: true,
  name: "x-date-time",
  props: {
    modelValue: {
      //type: String,
      required: true
    },
    mask: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    value: {
      get () {
        return this.modelValue || null
      },
      set (val) {
        this.$emit('update:modelValue', val)
      }
    },
    computedMask () {
      return this.mask.replace(/[\w]/gi, '#')
    }
  }
}
</script>

<style scoped>

</style>