import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { SortDirTypes } from '../../Util';
import SortHeader from './SortHeader';

it('renders the default', () => {
  const component = renderer.create(
    <SortHeader onClick={jest.fn()} sortDir={SortDirTypes.NONE}>
      příjmení
    </SortHeader>
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it('renders jméno sestupně', () => {
  const component = renderer.create(
    <SortHeader onClick={jest.fn()} sortDir={SortDirTypes.DESC}>
      jméno
    </SortHeader>
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it('maps onClick to dispatch onClick action', () => {
  const onClick = jest.fn();
  const wrapper = mount(
    <SortHeader onClick={onClick} sortDir={SortDirTypes.ASC}>
      jméno
    </SortHeader>
  );
  expect(wrapper.find('a')).toHaveLength(1);
  wrapper.find('a').simulate('click');

  expect(onClick).toHaveBeenCalledWith();
});
