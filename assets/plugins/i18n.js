import {createI18n, useI18n} from 'vue-i18n'

import {defaultLocale, languages} from "../i18n";

const i18n = createI18n({
    legacy: false,
    fallbackLocale: 'ru',
    locale: defaultLocale,
    silentTranslationWarn: true,
    silentFallbackWarn: true,
    globalInjection: true,
    I18nInjectionKey: 'i18n',
    useI18nComponentName: true,
    scope: 'global',
    //scope: 'parent',
    //scope: 'local',
    //I18nScope: 'parent',
    messages: {...languages}
})
//console.log(i18n)
export default i18n