import { createStore } from "vuex";
import {authentication} from "./authenticated";
import {snackbar} from "./snackbar";
import {alert} from "./alert";
export default createStore({
    modules: {
        authentication,
        snackbar,
        alert
    }
});