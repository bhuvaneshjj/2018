import { combineReducers } from 'redux';
import authReducer from '../auth/authReducer';
import casomericReducer from '../casomeric/casomericReducer';
import registratorReducer from '../registrator/registratorReducer';
import entitiesReducer from '../entities/entitiesReducer';

const connected = (state = false, action) => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECTED':
      return true;
    case 'WEBSOCKET_DISCONNECTED':
      return false;
    default:
      return state;
  }
};

const fetching = (state = 'init', action) => {
  switch (action.type) {
    case 'FETCH_UCASTNICI_REQUEST':
      return 'fetching';
    case 'FETCH_UCASTNICI_SUCCESS':
    case 'FETCH_UCASTNICI_ERROR':
      return 'done';
    default:
      return state;
  }
};

const appReducer = combineReducers({
  auth: authReducer,
  casomeric: casomericReducer,
  registrator: registratorReducer,
  entities: entitiesReducer,
  connected,
  fetching
});

export default appReducer;
