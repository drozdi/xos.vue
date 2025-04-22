import props from './props/i18n'

export default {
    ...props,
    methods: {
        t () {
            if (!this.$i18n) {
                return arguments[0]
            }
            if (this.i18nKey && this.$te(this.i18nKey+'.'+arguments[0])) {
                arguments[0] = this.i18nKey+'.'+arguments[0]
            } else if (this.$te(this.$options.name+'.'+arguments[0])) {
                arguments[0] = this.$options.name+'.'+arguments[0]
            }
            return this.$t.apply(this, arguments)
        }
    }
}