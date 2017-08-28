
import * as types from './mutations_types'

export default {
  [types.GET_STAFF](state, staff) {
    state.staff = staff;
  },
};
