import * as types from './mutations_types';

export default {
  get_staff: ({commit}, staff) => {
    commit(types.GET_STAFF, staff);
  },
};
