import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/device/types', {
    select (filters = {}, sortBy= []) {
        return this.list(filters, sortBy, -1, 0, {t: "select"}).then(({data}) => {
            return data
        })
    },
    components () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/components`
        })
    },
    properties () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/properties`
        })
    },
})