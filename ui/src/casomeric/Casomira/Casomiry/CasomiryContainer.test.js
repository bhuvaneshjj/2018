import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import CasomiryContainer from './CasomiryContainer';

const mockStore = configureStore();

let store;
let wrapper;
beforeEach(() => {
  const state = {
    casomeric: {
      casomiry: {
        maraton: true,
        půlmaraton: false,
        cyklo: true,
        koloběžka: true
      }
    },
    entities: {
      stopky: {
        byTypy: {},
        typy: []
      }
    }
  };
  store = mockStore(state);
  store.dispatch = jest.fn();
  const component = mount(
    <Provider store={store}>
      <CasomiryContainer />
    </Provider>
  );
  wrapper = component.find('Casomiry');
});

it('maps state and dispatch to props', () => {
  expect(wrapper.props().casomiry).toMatchSnapshot();
  expect(wrapper.props().onRemove).toEqual(expect.any(Function));
});

it('maps onRemove to dispatch removeCasomira', () => {
  wrapper.props().onRemove('půlmaraton');

  expect(store.dispatch).toHaveBeenCalledWith({
    type: 'CASOMIRY_REMOVE_CASOMIRA',
    casomira: 'půlmaraton'
  });
});
