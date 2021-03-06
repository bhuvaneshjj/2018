import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { ActionPrefixes, ReduxNames } from '../../constants';
import ucastniciTestData from '../../entities/ucastnici/ucastniciTestData';
import Prihlasky from './Prihlasky';
import PrihlaskyDohlaskyMain from './PrihlaskyDohlaskyMain';

const actionPrefix = ActionPrefixes.PRIHLASKY;
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const reduxName = ReduxNames.prihlasky;

const store = mockStore({
  ...ucastniciTestData,
  fetchingUcastnici: 'done',
  registrator: {
    [reduxName]: {
      form: {
        saved: false,
        saving: false,
        udaje: { narozeni: {} },
        prihlaska: {},
        platby: [],
        ubytovani: {},
      },
      platby: {
        novaPlatbaMinified: true,
      },
      startCislo: { showing: false },
    },
  },
});

it('renders /prihlasky route', () => {
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/prihlasky']}>
        <Route path="/prihlasky" component={Prihlasky} />
      </MemoryRouter>
    </Provider>
  );

  expect(wrapper.find(PrihlaskyDohlaskyMain)).toHaveLength(1);
});

it('renders /prihlasky/edit route', () => {
  store.dispatch = jest.fn();
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/prihlasky/edit']}>
        <Route path="/prihlasky" component={Prihlasky} />
      </MemoryRouter>
    </Provider>
  );

  expect(wrapper.find('Connect(PrihlaskyForm)')).toHaveLength(1);
  expect(wrapper.find('Connect(PrihlaskyForm)').props()).toMatchSnapshot();
  expect(store.dispatch).toHaveBeenCalledTimes(1); // fetchUcastnici
});

it('renders /prihlasky/reset route', () => {
  store.dispatch = jest.fn();
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/prihlasky/reset']}>
        <Route path="/prihlasky" component={Prihlasky} />
      </MemoryRouter>
    </Provider>
  );

  expect(wrapper.find('Connect(PrihlaskyForm)')).toHaveLength(1);
  expect(wrapper.find('Connect(PrihlaskyForm)').props()).toMatchSnapshot();
  expect(store.dispatch).toHaveBeenCalledTimes(3); // fetchUcastnici + Form/reset + Platby/reset
  expect(store.dispatch).toHaveBeenCalledWith({
    type: `${actionPrefix}_RESET`,
    datumKonani: expect.any(String),
  });
  expect(store.dispatch).toHaveBeenCalledWith({ type: `${actionPrefix}_NOVA_PLATBA_RESET` });
});

it('renders /prihlasky/:id route', () => {
  store.dispatch = jest.fn();
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/prihlasky/6f09b1fd371dec1e99b7e1c9']}>
        <Route path="/prihlasky" component={Prihlasky} />
      </MemoryRouter>
    </Provider>
  );

  expect(wrapper.find('Connect(PrihlaskyForm)')).toHaveLength(1);
  expect(wrapper.find('Connect(PrihlaskyForm)').props()).toMatchSnapshot();
  expect(store.dispatch).toHaveBeenCalledTimes(2); // fetchUcastnici + load
  expect(store.dispatch).toHaveBeenCalledWith({
    id: '6f09b1fd371dec1e99b7e1c9',
    type: `${actionPrefix}_UCASTNIK_LOAD`,
    udaje: {
      jmeno: 'Martina',
      narozeni: { den: 7, mesic: 12, rok: 1963 },
      obec: 'Zl??n',
      pohlavi: '??ena',
      prijmeni: 'Sukdol??kov??',
      stat: '??esk?? republika',
    },
  });
});
