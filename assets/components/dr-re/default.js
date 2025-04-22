export default {
    w: '50%',
    h: '75%',
    x: 'center',
    y: 'center',
    z: 'auto',
    parent: 'body',
    draggable: false,
    resizable: false,
    lockAspectRatio: false,
    disableUserSelect: true,
    minWidth: 0,
    minHeight: 0,
    maxWidth: null,
    maxHeight: null,
    handles: () => (['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'])
}