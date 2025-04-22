import axios from '../../../plugins/axios';
import  { parameterize } from "../../../utils/request"
import { merge } from "../../../utils/_";
import  { responsesToCollection, getContentRangeSize, getCollectionAndTotal } from "../../../utils/responses"

export default class BaseRepository {
    constructor(entity, version = '') {
        this.entity = entity
        this.version = version? `/${version}`: ''
    }
    get endpoint () {
        return `${this.version}${this.entity}`
    }

    async query ({
                     method = 'GET',
                     nestedEndpoint = '',
                     urlParameters = {},
                     queryParameters = {},
                     data = undefined,
                     headers = {},
                 }) {
        const url = parameterize(`${this.endpoint}${nestedEndpoint}`, urlParameters);
        return await axios.request({
            method,
            url,
            headers,
            data,
            params: queryParameters
        })
    }

    async list (filters = {}, sortBy= [], limit = -1, offset = 0, options = {}) {
        const result = await this.query(merge({}, options, {
            data: { filters, sortBy, limit, offset },
            nestedEndpoint: '/list',
            method: 'POST',
        }, true));
        return getCollectionAndTotal(result);
    }
    async create (requestBody, urlParameters) {
        return await this.query({
            method: 'POST',
            nestedEndpoint: '/',
            urlParameters,
            data: requestBody,
        })
    }
    async get (id = '', urlParameters= {}, queryParameters = {}) {
        return await this.query({
            method: 'GET',
            nestedEndpoint: `/${id}`,
            urlParameters,
            queryParameters
        })
    }
    async update (id = '', requestBody, urlParameters= {}) {
        return await this.query({
            method: 'PUT',
            nestedEndpoint: `/${id}`,
            urlParameters,
            data: requestBody
        })
    }
    async select (filters = {}, sortBy= [], limit = -1, offset = 0, options = {}) {
        const result =  await this.query(merge({}, options, {
            data: { filters, sortBy, limit, offset },
            nestedEndpoint: '/list/select',
            method: 'POST',
        }, true))
        return getCollectionAndTotal(result)
    }
    async delete (id = '', requestBody = {}, urlParameters= {}) {
        return await this.query({
            method: 'DELETE',
            nestedEndpoint: `/${id}`,
            urlParameters,
            data: requestBody
        })
    }

    async getTotal (urlParameters, queryParameters = {}) {
        const { headers } = await this.query({
            queryParameters: { ...queryParameters, limit: 1 },
            urlParameters,
        });

        if (!headers['Content-Range']) {
            throw new Error('Content-Range header is missing');
        }

        return getContentRangeSize(headers['Content-Range']);
    }
 }

export function factoryRepository (endpoint, repositoryExtension = {}, version = '') {
    const repository = new BaseRepository(endpoint, version);
    return Object.assign(repository, repositoryExtension);
}