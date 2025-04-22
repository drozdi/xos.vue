import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/device/subDevices', {
    filter () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/filter`
        })
    },
    form (type = 0) {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/form/${type}`,
        })
    },
    attach (type = 0) {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/attach/${type}`,
        })
    }
})