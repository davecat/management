import menus from './sidebar';
import staff from './staff';
import button from './button';
import Vuex from 'vuex';
export default new Vuex.Store({
    modules: {
        menus: menus,
        staff: staff,
        button: button
    }
});
