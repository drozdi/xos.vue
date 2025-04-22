import { appsManager } from '../core'
import appMainOU from "./ou";
import appMainOUs from "./ous";
import appMainClaimant from "./claimant";
import appMainClaimants from "./claimants";
import appMainUser from "./user";
import appMainUsers from "./users";
import appMainGroup from "./group";
import appMainGroups from "./groups";

appsManager.append(appMainOUs, "./main/ous", {
    pathName: 'main-ous',
    i18nKey: 'main-ou',
    accessKey: 'main.ou',
    wmGroup: "main-ou",
    wmSort: 1
})
appsManager.append(appMainOU, "./main/ou", {
    pathName: 'main-ou-:id',
    i18nKey: 'main-ou',
    accessKey: 'main.ou',
    wmGroup: "main-ou",
    wmSort: 2
})

appsManager.append(appMainClaimants, "./main/claimants", {
    pathName: 'main-claimants',
    i18nKey: 'main-claimant',
    accessKey: 'main.claimant',
    wmGroup: "main-claimant",
    wmSort: 1
})
appsManager.append(appMainClaimant, "./main/claimant", {
    pathName: 'main-claimant-:id',
    i18nKey: 'main-claimant',
    accessKey: 'main.claimant',
    wmGroup: "main-claimant",
    wmSort: 2
})


appsManager.append(appMainUsers, "./main/users", {
    pathName: 'main-users',
    i18nKey: 'main-user',
    accessKey: 'main.user',
    wmGroup: "main-user",
    wmSort: 1
})
appsManager.append(appMainUser, "./main/user", {
    pathName: 'main-user-:id',
    i18nKey: 'main-user',
    accessKey: 'main.user',
    wmGroup: "main-user",
    wmSort: 2
})

appsManager.append(appMainGroups, "./main/groups", {
    pathName: 'main-groups',
    i18nKey: 'main-group',
    accessKey: 'main.group',
    wmGroup: "main-group",
    wmSort: 1
})
appsManager.append(appMainGroup, "./main/group", {
    pathName: 'main-group-:id',
    i18nKey: 'main-group',
    accessKey: 'main.group',
    wmGroup: "main-group",
    wmSort: 2
})
