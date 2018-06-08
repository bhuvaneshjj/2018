import React from 'react';
import PrihlaseniDohlaseniContainer from './PrihlaseniDohlaseniContainer';

const Prihlaseni = () => (
  <PrihlaseniDohlaseniContainer
    actionPrefix="PRIHLASENI"
    reduxName="prihlaseni"
    route="prihlasky"
  />
);

export default Prihlaseni;