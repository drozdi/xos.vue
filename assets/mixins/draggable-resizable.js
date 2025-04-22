import {useQuasar} from "quasar"
import { provideAppSize } from "../composables/provide"
import { useSize } from '../composables/useSize'

export default {
    inject: {
        $size: {
            from: provideAppSize,
            default: () => (useSize())
        }
    },
    computed: {
        active: {
            get () {
                return this.$size.active
            },
            set (value) {
                this.$size.active = value
            }
        },
        width: {
            get () {
                return this.$size.width
            },
            set (value) {
                this.$size.width = value
            }
        },
        height: {
            get () {
                return this.$size.height
            },
            set (value) {
                this.$size.height = value
            }
        },
        left: {
            get () {
                return this.$size.left
            },
            set (value) {
                this.$size.left = value
            }
        },
        top: {
            get () {
                return this.$size.top
            },
            set (value) {
                this.$size.top = value
            }
        }
    }
}