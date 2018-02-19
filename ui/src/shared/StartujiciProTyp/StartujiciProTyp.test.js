import React from 'react';
import renderer from 'react-test-renderer';
import moment from 'moment';
import StartujiciProTyp from './StartujiciProTyp';

it('žádný startující', () => {
  const component = renderer.create(<StartujiciProTyp startujici={[]} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it('jeden startující', () => {
  const startujici = [
    {
      id: '10',
      startCislo: 7,
      dokonceno: true,
      duration: moment.duration('PT4H15M32.45S'),
      onClick: jest.fn()
    }
  ];

  const component = renderer.create(<StartujiciProTyp startujici={startujici} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it('třináct startujících', () => {
  const startujici = [
    { id: '0', startCislo: 7, dokonceno: null },
    { id: '1', startCislo: 4, dokonceno: null },
    {
      id: '10',
      startCislo: 16,
      dokonceno: true,
      duration: moment.duration('PT4H15M32.45S'),
      onClick: jest.fn()
    },
    { id: '2', startCislo: 25, dokonceno: false },
    {
      id: '3',
      startCislo: 9,
      dokonceno: true,
      duration: moment.duration('PT2H17M29.14S'),
      onClick: jest.fn()
    },
    {
      id: '12',
      startCislo: 15,
      dokonceno: true,
      duration: moment.duration('PT3H59M59.01S'),
      onClick: jest.fn()
    },
    { id: '9', startCislo: 1, dokonceno: false },
    { id: '29', startCislo: 8, dokonceno: null },
    { id: '5', startCislo: 59, dokonceno: null },
    { id: '11', startCislo: 43, dokonceno: null },
    { id: '18', startCislo: 42, dokonceno: false },
    {
      id: '10',
      startCislo: 33,
      dokonceno: true,
      duration: moment.duration('PT3H30M22.45S'),
      onClick: jest.fn()
    },
    { id: '7', startCislo: 21, dokonceno: false },
    {
      id: '13',
      startCislo: 24,
      dokonceno: true,
      duration: moment.duration('PT3H33M14.15S'),
      onClick: jest.fn()
    },
    { id: '34', startCislo: 27, dokonceno: null },
    { id: '14', startCislo: 22, dokonceno: null },
    { id: '58', startCislo: 30, dokonceno: null },
    {
      id: '15',
      startCislo: 23,
      dokonceno: true,
      duration: moment.duration('PT3H27M42.38S'),
      onClick: jest.fn()
    },
    { id: '59', startCislo: 26, dokonceno: null }
  ];

  const component = renderer.create(<StartujiciProTyp startujici={startujici} />);
  expect(component.toJSON()).toMatchSnapshot();
});