import { watch, onUnmounted } from "vue"
import { defineReactiveModel } from "./utils/defineReactiveModel"
import { createInjectionState } from "./utils/createInjectionState"
import { provideAppSize } from './provide'

const SIZE_LIST = [ 'xs', 'sm', 'md', 'lg', 'xl' ]
function stateSize (width= 0, height = 0) {
    return defineReactiveModel({
        width: width,
        height: height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        active: false,
        name: 'xs',
        sizes: { xs: 0, sm: 600, md: 1024, lg: 1440, xl: 1920 },
        lt: { xs: true, sm: true, md: true, lg: true, xl: true },
        gt: {xs: false, sm: false, md: false, lg: false, xl: false },
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false
    }, {
        install () {
            this.update()
            onUnmounted(watch(() => this.width, () => {
                this.update()
            }))
            onUnmounted(watch(() => this.sizes, () => {
                this.update()
            }))
        },
        update () {
            this.gt.xs = this.width >= this.sizes.sm
            this.gt.sm = this.width >= this.sizes.md
            this.gt.md = this.width >= this.sizes.lg
            this.gt.lg = this.width >= this.sizes.xl
            this.lt.sm = this.width < this.sizes.sm
            this.lt.md = this.width < this.sizes.md
            this.lt.lg = this.width < this.sizes.lg
            this.lt.xl = this.width < this.sizes.xl
            this.xs = this.lt.sm
            this.sm = this.gt.xs === true && this.lt.md === true
            this.md = this.gt.sm === true && this.lt.lg === true
            this.lg = this.gt.md === true && this.lt.xl === true
            this.xl = this.gt.lg
            this.name = (this.xs === true && 'xs')
                || (this.sm === true && 'sm')
                || (this.md === true && 'md')
                || (this.lg === true && 'lg')
                || 'xl'
        },
        getSize () {
            return [this.width, this.height]
        },
        getPosition () {
            return [this.left, this.top]
        },
        setSizes (sizes = {}) {
            SIZE_LIST.forEach(name => {
                if (sizes[ name ]) {
                    this.sizes[ name ] = sizes[ name ]
                }
            })
        },
    })
}

export function useSize (...args) {
    return injectSize() || provideSize(...args)
}

const [provideSize, injectSize] = createInjectionState(stateSize, {
    injectionKey: provideAppSize
});

export {
    stateSize,
    provideSize,
    injectSize
}