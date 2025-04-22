export function parse (obj) {
    function k (ret, key, val) {
        let r = ret, l = key.pop();
        for (let k of key) {
            r[k] = r[k] || {}
            r = r[k]
        }
        r[l] = val
    }
    let ret = {};
    for (let key of Object.keys(obj)) {
        k(ret, key.split("."), obj[key])
    }
    return ret;
}
export function format (data, filters) {
    function n (data, key, val) {
        if (typeof val == 'object' && null !== val) {
            data[key] = data[key] || {};
            for (let k of Object.keys(val)) {
                n(data[key], k, val[k]);
            }
        } else {
            data[key] = val;
        }
    }
    for (let key of Object.keys(filters)) {
        n(data, key, filters[key]);
    }
}

// parameterize :: replace substring in string by template
// parameterize :: Object -> String -> String
// parameterize :: {userId: '123'} -> '/users/:userId/activate' -> '/users/123/activate'
export function parameterize (url, urlParameters) {
    return Object.entries(urlParameters)
        .reduce(
            (a, [key, value]) => a.replace(`:${key}`, value),
            url,
        );
}