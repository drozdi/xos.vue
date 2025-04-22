import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/main/group', {
    select (filters = {}, sortBy= []) {
        return this.list(filters, sortBy, -1, 0, {t: "select"}).then(({data}) => {
            return data
        })
    },
    filter () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/filter`
        })
    }
})