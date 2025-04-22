import { computed } from "vue"
import { useQuasar } from 'quasar'
import { injectSize } from "./useSize";

export function useGrid (width = 500, props= {}) {
    const $size = injectSize(useQuasar().screen)
    $size.sizes.xs = $size.sizes.xs || 0
    return computed(() => {
        return $size.width < width? props: false;
    })
}
export function useGridSize (props= {}) {
    const $size = injectSize(useQuasar().screen)
    $size.sizes.xs = $size.sizes.xs || 0
    return computed(() => {
        return (['xs', 'sm', 'md', 'lg', 'xl']).reduce((size, key) => {
            if ($size.sizes[key] < $size.width && props[key]) {
                return props[key] || size
            }
            return size
        }, 1)
    })
}