import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios,axios);

export default {
    get_staff(state){
        Vue.axios.get("/api/v1/user/current").then((response) => {
            state.staff = response.data;
        }).catch((error) => {
            console.log(error);
        })
    }
};