import { computed, watch, ref } from 'vue'
import { useQuasar } from "quasar";
import { useI18n } from "../../../composables/useI18n";
import { appsManager } from "../../core";
import form from "../software";

export default function ($app = null) {
    const $i18n = useI18n()
    const $q = useQuasar()
    $app?.on('view', (item, conf = {}) => {
        appsManager.createApp(form, {
            ...conf,
            id: item.id
        })
    })
    $app?.on('add', (item, conf = {}) => {
        appsManager.createApp(form, {
            ...conf,
            id: 0
        })
    })
    $app?.on('edit', (item, conf = {}) => {
        appsManager.createApp(form, {
            ...conf,
            id: item.id
        });
    })
    $app?.on('loaded', (item) => {})
    $app?.on('created', (item) => {
        $q.notify({
            message: $i18n.t('success.save', item),
            color: 'positive',
            progress: true
        })
    })
    $app?.on('updated', (item) => {
        $q.notify({
            message: $i18n.t('success.update', item),
            color: 'positive',
            progress: true
        })
    })
    $app?.on('removed', (item) => {
        $q.notify({
            message: $i18n.t('success.remove', item),
            color: 'positive',
            progress: true
        })
        $app.emit('reload')
    })

}