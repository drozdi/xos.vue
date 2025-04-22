import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/main/ou', {
    async select (filters = {}, sortBy= []) {
        return await this.list(filters, sortBy, -1, 0, {t: "select"}).then(({data}) => {
            return data
        })
    }
})