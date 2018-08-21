import { combineReducers } from 'redux';
import signInReducer from './SignIn/signInReducer';

const authenticatedReducer = (state = false, action) => {
  switch (action.type) {
    case 'SIGN_IN_SUCCESS':
      return true;
    case 'SIGN_IN_ERROR':
    case 'SIGN_OUT_SUCCESS':
    case 'SIGN_OUT_ERROR':
      return false;
    default:
      return state;
  }
};

const decodedTokenReducer = (state = null, action) => {
  switch (action.type) {
    case 'SIGN_IN_SUCCESS':
      return action.response.decodedToken;
    case 'SIGN_IN_ERROR':
    case 'SIGN_OUT_SUCCESS':
    case 'SIGN_OUT_ERROR':
      return null;
    default:
      return state;
  }
};

const tokenReducer = (state = null, action) => {
  switch (action.type) {
    case 'SIGN_IN_SUCCESS':
      return action.response.token;
    case 'SIGN_IN_ERROR':
    case 'SIGN_OUT_SUCCESS':
    case 'SIGN_OUT_ERROR':
      return null;
    default:
      return state;
  }
};

const authReducer = combineReducers({
  authenticated: authenticatedReducer,
  signIn: signInReducer,
  decodedToken: decodedTokenReducer,
  token: tokenReducer
});

export default authReducer;
