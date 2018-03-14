export const initialState = { allIds: [], byIds: {}, invalidated: false };

// První element je vždycky nejvyšší rok.
const addRokAndSort = (roky, rok) => [...roky, rok].sort((a, b) => b - a);

const updateUcast = (state, id, rok, name, obj) => {
  let { allIds, byIds } = state;

  let ucastnik = byIds[id];
  if (!ucastnik) {
    ucastnik = { roky: [] };
    allIds = [...allIds, id];
  }

  let ucast = ucastnik[rok];
  if (!ucast) {
    ucast = {};
    ucastnik = { ...ucastnik, roky: addRokAndSort(ucastnik.roky, rok) };
  }

  ucast = { ...ucast, [name]: obj };
  ucastnik = { ...ucastnik, [rok]: ucast };
  byIds = { ...byIds, [id]: ucastnik };
  return { ...state, allIds, byIds };
};

const ucastniciReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'BROADCAST_UCASTNIK': {
      const { id, roky, ...ucasti } = action.data;
      const updated = { ...state, byIds: { ...state.byIds, [id]: { roky, ...ucasti } } };
      return state.byIds[id] ? updated : { ...updated, allIds: [...updated.allIds, id] };
    }
    case 'FETCH_UCASTNICI_SUCCESS':
      return { ...action.data, invalidated: false };
    case 'PRIHLASKY_SAVE_SUCCESS': {
      const { id, rok, udaje, prihlaska, platby, ubytovani } = action;
      const state1 = updateUcast(state, id, rok, 'udaje', udaje);
      const state2 = updateUcast(state1, id, rok, 'prihlaska', prihlaska);
      const state3 = updateUcast(state2, id, rok, 'platby', platby);
      return updateUcast(state3, id, rok, 'ubytovani', ubytovani);
    }
    case 'SIGN_OUT_SUCCESS':
      return initialState;
    case 'WEBSOCKET_DISCONNECTED':
      return { ...state, invalidated: true };
    default:
      return state;
  }
};

export default ucastniciReducer;
