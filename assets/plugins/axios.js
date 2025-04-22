import axios from 'axios'
import store from '../store'


const instance = axios.create({
    //baseURL: 'http://localhost:8000/',
    //withCredentials: true,
    headers: {
        //'X-Requested-With': "XMLHttpRequest",
        //'Accept': "application/json, text/javascript, */*; q=0.01",
        //'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        "Content-Type": "application/json"
        //'Access-Control-Allow-Origin': "*",
        //"Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        //"Access-Control-Allow-Headers": "origin, x-requested-with, content-type"
    }
});

instance.interceptors.response.use((response) => {
    //console.log(response);
    //return response.data;
    return response;
}, (error) => {
    //console.log(error);
    if (error.response.status !== 401 && error.response.status !== 400) {
        store.dispatch('alert/error', error.response.data);
    }
    return Promise.reject(error.response);
});//*/

export default instance;

