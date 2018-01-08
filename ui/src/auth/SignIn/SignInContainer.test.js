import React from 'react';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import WsClient from '../../WsClient';
import SignInContainer from './SignInContainer';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockWsClient = new WsClient();
mockWsClient.sendRequest = async () => ({});

let store;
let wrapper;
beforeEach(() => {
  const state = {
    auth: {
      signIn: { isSigningIn: false, errorCode: 'code', errorMessage: 'message', showError: false }
    }
  };
  store = mockStore(state);
  store.dispatch = jest.fn();
  wrapper = shallow(<SignInContainer store={store} />);
});

it('maps state and dispatch to props', () => {
  expect(wrapper.props().isSigningIn).toBe(false);
  expect(wrapper.props().errorCode).toEqual('code');
  expect(wrapper.props().errorMessage).toEqual('message');
  expect(wrapper.props().showError).toBe(false);
  expect(wrapper.props()).toEqual(expect.objectContaining({ onSubmit: expect.any(Function) }));
});

it('maps onSubmit to dispatch signIn action', async () => {
  await wrapper.props().onSubmit('tumáš', 'jcm');

  expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
});

it('maps onHideError to dispatch hideSignInError action', async () => {
  wrapper.props().onHideError();

  expect(store.dispatch).toHaveBeenCalledWith({ type: 'SIGN_IN_HIDE_ERROR' });
});