import { inject } from 'vue'
import { provideDR } from '../utils/provide'
import { useQuasar } from 'quasar'
import { getComputedSize } from '../utils/dom'

export default {
    name: 'x-col',
    mounted (el, binding) {
        const $q = binding.instance.$q
        let width = inject(provideDR, $q.screen).width
        let size = null;
        (['xs', 'sm', 'md', 'lg', 'xl']).forEach((key) => {
            if (!$q.screen.sizes[key] || $q.screen.sizes[key] < width) {
                size = (binding.value || {})[key] || ''
            }
        })
        size = size? 'col-'+size: null
        size && el.classList.add(size)
    },
    updated (el, binding) {
        const $q = binding.instance.$q
        let [width, ] = getComputedSize(el.parentNode)
        //let width = inject(provideDR, useQuasar().screen).width
        let size = null;
        (['xs', 'sm', 'md', 'lg', 'xl']).forEach((key) => {
            if (!$q.screen.sizes[key] || $q.screen.sizes[key] < width) {
                size = (binding.value || {})[key] || ''
            }
        })
        size = size? 'col-'+size: null
        size && el.classList.add(size)
    }
}