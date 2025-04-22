import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/device/properties', {
    select (filters = {}, sortBy= []) {
        return this.list(filters, sortBy, -1, 0, {t: "select"}).then(({data}) => {
            return data
        })
    },
})