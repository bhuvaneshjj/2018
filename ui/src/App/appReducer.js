import { combineReducers } from 'redux';
import startujiciReducer from '../casomeric/Startujici/startujiciReducer';
import casomericReducer from '../casomeric/Casomeric/casomericReducer';
import ucastniciReducer from '../Ucastnici/ucastniciReducer';

const appReducer = combineReducers({
  casomeric: casomericReducer,
  startujici: startujiciReducer,
  ucastnici: ucastniciReducer
});

export default appReducer;
