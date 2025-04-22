import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/device/device', {
    filter () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/filter`
        })
    },
    property (id) {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/property/:id`,
            urlParameters: {
                'id': id
            }
        })
    },
    properties (type) {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/properties/:id`,
            urlParameters: {
                'id': type
            }
        })
    }
})