import { getCurrentInstance } from 'vue'

export function useClassName () {
    let vm = getCurrentInstance().proxy
    function className (elem, mod) {
        let cl = vm.$options.name;
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
    }
    function queryName (elem, mod) {
        return vm.$el.querySelector('.'+className(elem, mod));
    }
    return { className, queryName }
}