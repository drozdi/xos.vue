import {isFunction} from "./fns";

export function getComputedSize ($el, def = [0,0]) {
    if (!$el) {
        return def
    }
    if (!$el.nodeType) {
        $el = document.querySelector($el)
    }
    const style = window.getComputedStyle($el)
    return [
        parseFloat(style.getPropertyValue('width') || 0, 10),
        parseFloat(style.getPropertyValue('height') || 0, 10)
    ]
}
export function getComputedStyle ($el) {
    if (!$el) {
        return {};
    }
    if (!$el.nodeType) {
        $el = document.querySelector($el)
    }
    return window.getComputedStyle($el);
}
export function matchesSelectorToParentElements (el, selector, baseNode) {
    let node = el

    const matchesSelectorFunc = [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector',
        'oMatchesSelector',
    ].find((func) => isFunction(node[func]))

    if (!isFunction(node[matchesSelectorFunc])) return false

    do {
        if (node[matchesSelectorFunc](selector)) return true
        if (node === baseNode) return false
        node = node.parentNode
    } while (node)

    return false
}

export function addEvent (el, event, handler) {
    if (!el) {
        return
    }
    if (el.attachEvent) {
        el.attachEvent('on' + event, handler)
    } else if (el.addEventListener) {
        el.addEventListener(event, handler, true)
    } else {
        el['on' + event] = handler
    }
}
export function removeEvent (el, event, handler) {
    if (!el) {
        return
    }
    if (el.detachEvent) {
        el.detachEvent('on' + event, handler)
    } else if (el.removeEventListener) {
        el.removeEventListener(event, handler, true)
    } else {
        el['on' + event] = null
    }
}

export function addEvents (events) {
    events.forEach(function (cb, eventName) {
        document.documentElement.addEventListener(eventName, cb);
        //addEvent(document.documentElement, eventName, cb)
    });
}
export function removeEvents (events) {
    events.forEach(function (cb, eventName) {
        document.documentElement.removeEventListener(eventName, cb);
        //removeEvent(document.documentElement, eventName, cb)
    });
}