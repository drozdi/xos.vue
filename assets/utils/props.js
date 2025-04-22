import { inject } from 'vue'

import {breakpoints} from './breakpoints';
import {camelize, capitalize} from "./string";
import { isObject, isSymbol } from "./is";

export function makeProp (
    type = undefined,
    value = undefined,
    requiredOrValidator = undefined,
    validator = undefined
) {
    const required = requiredOrValidator === true;
    validator = required? validator :requiredOrValidator;
    return {
        ...(type? { 'type': type }: {}),
        ...(value? { 'default': typeof value === 'object'? function () { return value; }: value }: {}),
        ...(required? {'required': required}: {}),
        ...(validator? { 'validator': validator }: {})
    }
}
export function makeProps (prefix, propOptions) {
    const add = {};
    breakpoints.forEach(function (breakpoint) {
        add[propName(prefix, breakpoint)] = propOptions;
    });
    return add;
}
export function propName (prop, breakpoint) {
    return camelize(prop + capitalize(breakpoint));
}


export function propsFactory (props, source) {
    return function (defaults) {
        return Object.keys(props).reduce((obj, prop) => {
            const isObjectDefinition = typeof props[prop] === 'object' && props[prop] != null && !Array.isArray(props[prop]);
            const definition = isObjectDefinition ? props[prop] : {
                type: props[prop]
            };
            if (defaults && prop in defaults) {
                obj[prop] = {
                    ...definition,
                    default: defaults[prop]
                };
            } else {
                obj[prop] = definition;
            }
            if (source && !obj[prop].source) {
                obj[prop].source = source;
            }
            return obj;
        }, {});
    };
}
export function propsParent (make, step1, step2) {
    let injFirst = false, def = {}, inj = undefined
    if (isSymbol(step1)) {
        injFirst = true
        inj = step1 || undefined
        def = {...(step2 || {})}
    } else {
        injFirst = false
        inj = step2 || undefined
        def = {...(step1 || {})}
    }
    const props = make()
    return make(Object.keys(props).reduce((obj, prop) => {
        obj[prop] = () => {
            let val = (injFirst?
                {...inject(inj, {}), ...def}:
                {...def, ...inject(inj, def)})[prop] || props[prop].default
            return typeof val === "function"? val(): val
        }
        return obj;
    }, {}))
    /*return make(Object.keys(props).reduce((obj, prop) => {
        obj[prop] = () => {
            let val = (injFirst?
                {...def, ...inject(inj, {})}:
                {...inject(inj, def), ...def})[prop]
            return typeof val === "function"? val(): val
        }
        return obj;
    }, {}))*/
}
export function propsProvide (props, make) {
    return Object.keys(make()).reduce((obj, prop) => {
        obj[prop] = props[prop]
        return obj
    }, {})
}

export function parentProps (make, def, inj) {
    const props = make()
    return make(Object.fromEntries(Object.keys(props).map((prop) => {
            return [prop, () => {
                let val = {...def,...inject(inj, def)}[prop] || props[prop].default
                return typeof val === "function"? val(): val
            }]
        })))
}