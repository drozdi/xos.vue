import {factoryRepository} from "../../core/utils/BaseRepository";

export default factoryRepository('/device/software', {
    filter () {
        return this.query({
            method: 'GET',
            nestedEndpoint: `/filter`
        })
    }
})