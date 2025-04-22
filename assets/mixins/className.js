export default {
    methods: {
        queryName: function (elem, mod) {
            return this.$el.querySelector('.'+this.className(elem, mod));
        },
        className (elem, mod) {
            let cl = this.$options.name;
            if (elem) {
                cl = elem.split(/\s+/).map((val) => {
                    return cl+"__"+val;
                })
            }
            cl = [].concat(cl)
            if (mod) {
                cl = cl.map((val) => {
                    return val+"--"+mod;
                })
            }
            return cl.join(' ');
        },
    }
}