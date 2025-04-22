export default function (name, def = null, props = null) {
    let propName = null;
    if (props) {
        propName = 'sm-' + name;
    }

    let res = {
        data () {
            return {
                [name]: propName? this[propName]: def
            }
        },
        created () {
            this[name] = this.sm.get(name, def);
        },
        watch: {
            [name]: {
                handler () {
                    this.sm.set(name, this[name]);
                },
                deep: true
            }
        }
    };

    if (propName) {
        props.default = props.default || def;
        res.props = {
            [propName]: props
        }
    }

    return res;
}