import OS, { appsManager } from '../core'
import appType from "./type"
import appTypes from "./types"
import appProperty from "./property"
import appProperties from "./properties"
import appComponent from "./component"
import appComponents from "./components"
import appSoftware from "./software"
import appSoftwares from "./softwares"
import appSoftwareType from "./software/type"
import appSoftwareTypes from "./software/types"
import appLicenses from "./licenses"
import appLicense from "./license"
import appLicenseKey from "./license-key"
import appDevice from "./device"
import appDevices from "./devices"
import appSubDevices from "./sub-devices"
import appSubDevice from "./sub-device"

appsManager.append(appSoftwares, "./device/softwares", {
    pathName: 'device-softwares',
    i18nKey: 'device-software',
    accessKey: 'device.software',
    wmGroup: "device-software",
    wmSort: 1
})
appsManager.append(appSoftware, "./device/software", {
    pathName: 'device-software-:id',
    i18nKey: 'device-software',
    accessKey: 'device.software',
    wmGroup: "device-software",
    wmSort: 2
})

appsManager.append(appSoftwareTypes, "./device/software/types", {
    pathName: 'device-software-types',
    i18nKey: 'device-software-type',
    accessKey: 'device.software.type',
    wmGroup: "device-software-type",
    wmSort: 1
})
appsManager.append(appSoftwareType, "./device/software/type", {
    pathName: 'device-software-type-:id',
    i18nKey: 'device-software-type',
    accessKey: 'device.software.type',
    wmGroup: "device-software-type",
    wmSort: 2
})

appsManager.append(appLicenses, "./device/licenses", {
    pathName: 'device-licenses',
    i18nKey: 'device-license',
    accessKey: 'device.license',
    wmGroup: "device-license",
    wmSort: 1
})
appsManager.append(appLicense, "./device/license", {
    pathName: 'device-license-:id',
    i18nKey: 'device-license',
    accessKey: 'device.license',
    wmGroup: "device-license",
    wmSort: 2
})
appsManager.append(appLicenseKey, "./device/license/key", {
    pathName: 'device-license-key-:id',
    i18nKey: 'device-license-key',
    accessKey: 'device.license',
    wmGroup: "device-license",
    wmSort: 2
})

appsManager.append(appTypes, "./device/types", {
    pathName: 'device-types',
    i18nKey: 'device-type',
    accessKey: 'device.type',
    wmGroup: "device-type",
    wmSort: 1
})
appsManager.append(appType, "./device/type", {
    pathName: 'device-type-:id',
    i18nKey: 'device-type',
    accessKey: 'device.type',
    wmGroup: "device-type",
    wmSort: 2
})

appsManager.append(appProperties, "./device/properties", {
    pathName: 'device-properties',
    i18nKey: 'device-property',
    accessKey: 'device.property',
    wmGroup: "device-property",
    wmSort: 1
})
appsManager.append(appProperty, "./device/property", {
    pathName: 'device-property-:id',
    i18nKey: 'device-property',
    accessKey: 'device.property',
    wmGroup: "device-property",
    wmSort: 2
})

appsManager.append(appComponents, "./device/components", {
    pathName: 'device-components',
    i18nKey: 'device-component',
    accessKey: 'device.component',
    wmGroup: "device-component",
    wmSort: 1
})
appsManager.append(appComponent, "./device/component", {
    pathName: 'device-component-:id',
    i18nKey: 'device-component',
    accessKey: 'device.component',
    wmGroup: "device-component",
    wmSort: 2
})

appsManager.append(appDevices, "./device/devices", {
    pathName: 'device-devices',
    i18nKey: 'device-device',
    accessKey: 'device.device',
    wmGroup: "device-device",
    wmSort: 1
})
appsManager.append(appDevice, "./device/device", {
    pathName: 'device-device-:id',
    i18nKey: 'device-device',
    accessKey: 'device.device',
    wmGroup: "device-device",
    wmSort: 2
})

appsManager.append(appSubDevices, "./device/sub-devices", {
    pathName: 'device-sub-devices',
    i18nKey: 'device-sub-device',
    accessKey: 'device.subDevice',
    wmGroup: "device-sub-device",
    wmSort: 1
})
appsManager.append(appSubDevice, "./device/sub-device", {
    pathName: 'device-sub-device-:id',
    i18nKey: 'device-sub-device',
    accessKey: 'device.subDevice',
    wmGroup: "device-sub-device",
    wmSort: 2
})
