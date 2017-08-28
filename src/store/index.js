import menus from './sidebar';
import staff from './staff';
import Vuex from 'vuex';

export default new Vuex.Store({
    modules: {
        menus: menus,
        staff: staff
    }
});
