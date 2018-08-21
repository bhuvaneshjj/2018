import deepFreeze from 'deep-freeze';
import { signIn } from '../../auth/SignIn/SignInActions';
import { signOutError } from '../../auth/SignOut/SignOutActions';
import { createVykon, deleteVykon } from '../../registrator/Startujici/StartujiciActions';
import { createFailureFromAction } from '../../store/wsAPI';
import { hideError } from './ErrorInModalActions';
import errorInModalReducer from './errorInModalReducer';

const unsuccessfulSignInResponse = {
  code: 'password incorrect',
  status: 'Špatné jméno či heslo. Uživatel může být též zamčený.',
  requestId: '0.9310306652587374'
};

const unsuccessfulSignOutResponse = {
  code: 'authentication token invalid',
  status: 'Špatný ověřovací token. Zkus se přihlásit znovu.',
  requestId: '0.9310306652587371'
};

it('na začátku', () => {
  const stateBefore = undefined;

  const stateAfter = errorInModalReducer(stateBefore, {});
  expect(stateAfter.code).toEqual('');
  expect(stateAfter.message).toEqual('');
  expect(stateAfter.show).toBe(false);
  expect(stateAfter.title).toEqual('');
});

global.crypto = { getRandomValues: arr => arr.fill(86) };

it('SIGN_IN_ERROR', () => {
  const stateBefore = {};
  const stateAfter = {
    code: 'password incorrect',
    message: 'Špatné jméno či heslo. Uživatel může být též zamčený.',
    show: true,
    title: 'přihlašování'
  };
  deepFreeze(stateBefore);

  expect(
    errorInModalReducer(
      stateBefore,
      createFailureFromAction({ action: signIn({}), response: unsuccessfulSignInResponse })
    )
  ).toEqual(stateAfter);
});

it('signOutError()', () => {
  const stateBefore = {};
  const stateAfter = {
    code: 'authentication token invalid',
    message: 'Špatný ověřovací token. Zkus se přihlásit znovu.',
    show: true
  };
  deepFreeze(stateBefore);

  expect(errorInModalReducer(stateBefore, signOutError(unsuccessfulSignOutResponse))).toEqual(
    stateAfter
  );
});

it('STARTUJICI_CREATE_VYKON_ERROR', () => {
  const stateBefore = {};
  const stateAfter = {
    code: 'unfulfilled request',
    message: 'A strange error occurred.',
    show: true,
    title: 'vytváření registrace na start'
  };
  deepFreeze(stateBefore);

  const request = { id: '===id===', rok: 2018 };
  const response = { code: 'unfulfilled request', status: 'A strange error occurred.' };
  expect(
    errorInModalReducer(
      stateBefore,
      createFailureFromAction({ action: createVykon({}), request, response })
    )
  ).toEqual(stateAfter);
});

it('STARTUJICI_DELETE_VYKON_ERROR', () => {
  const stateBefore = {};
  const stateAfter = {
    code: 'unfulfilled request',
    message: 'A strange error occurred.',
    show: true,
    title: 'rušení registrace na start'
  };
  deepFreeze(stateBefore);

  const request = { id: '===id===', rok: 2018 };
  const response = { code: 'unfulfilled request', status: 'A strange error occurred.' };
  expect(
    errorInModalReducer(
      stateBefore,
      createFailureFromAction({ action: deleteVykon({}), request, response })
    )
  ).toEqual(stateAfter);
});

it('hideError()', () => {
  const stateBefore = { code: 'code', message: 'Errrorr!', show: true, title: 'Chyba při něčem!' };
  const stateAfter = { code: '', message: '', show: false, title: '' };
  deepFreeze(stateBefore);

  expect(errorInModalReducer(stateBefore, hideError())).toEqual(stateAfter);
});
