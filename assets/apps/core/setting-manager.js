import Setting from "./utils/setting";
import SettingManager from "./utils/setting-manager";
import config from "./config";


import confLayout from "../../components/layout/default";
import confWindow from "../../components/window/default";
import confModal from "../../components/modal/default";

import confForm from "../../components/windows/form";
import confTable from "../../components/windows/table";

export default new SettingManager({
    'CONFIG': config,
    'APP': Setting(config, {

    }, 'HKEY_APPLICATION'),
    'LAYOUT': Setting(confLayout, {

    }, 'HKEY_LAYOUT'),
    'MODAL': Setting(confModal, {

    }, 'HKEY_MODAL'),
    'WINDOW': Setting(confWindow, {

    }, 'HKEY_WINDOWS'),
    'FORM': Setting(confForm, {

    }, 'WIN_FORM'),
    'TABLE': Setting(confTable, {

    }, 'WIN_TABLE'),
});