import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Panel, Well } from 'react-bootstrap';
import { version } from '../../package.json';
import { AKTUALNI_ROK } from '../constants';
import logo from './logo.svg';
import './About.css';

const About = ({ timeOffset = 0, username }) => (
  <Well>
    <Panel header={`Jirkovský crossmarathon ${AKTUALNI_ROK}`} bsStyle="info">
      <div className="About_row">
        <img src={logo} className="App-logo-animated" alt="logo" />
        <div>
          Aplikace <Glyphicon glyph="star" />
          Jirkovský crossmarathon {AKTUALNI_ROK} <Glyphicon glyph="star" />
          <br />
          Verze: {version}
          <br />
          Origin: {window.location.origin}
          <br />
          {username === null ? <span>Nepřihlášen</span> : <span>Přihlášen jako: {username}</span>}
          <br />
          Časová prodleva ze serveru: {timeOffset} ms
        </div>
      </div>
    </Panel>
  </Well>
);

About.propTypes = {
  timeOffset: PropTypes.number,
  username: PropTypes.string
};

export default About;
