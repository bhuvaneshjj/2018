import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import withAuth from '../auth/withAuth';
import withoutAuth from '../auth/withoutAuth';
import SignInContainer from '../auth/SignIn/SignInContainer';
import CasomericContainer from '../casomeric/Casomeric/CasomericContainer';
import UcastniciDigestContainer from '../registrator/UcastniciDigest/UcastniciDigestContainer';
import PrihlaseniContainer from '../registrator/Prihlaseni/PrihlaseniContainer';
import SignOutContainer from '../auth/SignOut/SignOutContainer';
import About from './About';
import './App.css';
import logo from './logo.svg';

const App = ({ authenticated, connected, username }) => (
  <div>
    <Navbar inverse>
      <Navbar.Header>
        <img src={logo} className={connected ? 'App-logo-animated' : 'App-logo'} alt="logo" />
      </Navbar.Header>
      <Nav className="App-Nav">
        {!authenticated && (
          <LinkContainer to="/signin">
            <NavItem eventKey={1}>Přihlášení</NavItem>
          </LinkContainer>
        )}
        {authenticated && [
          // TODO: JSX fragment would be more appropriate if eslint-react-plugin supported it.
          <LinkContainer key="casomeric" to="/casomeric">
            <NavItem eventKey={2}>Časoměřič</NavItem>
          </LinkContainer>,
          <LinkContainer key="ucastnici" to="/ucastnici">
            <NavItem eventKey={3}>Účastníci</NavItem>
          </LinkContainer>,
          <LinkContainer key="prihlaska" to="/prihlasky">
            <NavItem eventKey={4}>Přihlášky</NavItem>
          </LinkContainer>,
          <LinkContainer key="signout" to="/signout">
            <NavItem eventKey={5}>Odhlášení</NavItem>
          </LinkContainer>
        ]}
        <LinkContainer to="/about">
          <NavItem eventKey={6}>O aplikaci</NavItem>
        </LinkContainer>
      </Nav>
    </Navbar>
    <main>
      <Switch>
        <Route exact path="/" component={withAuth(CasomericContainer)} />
        <Route path="/signin" component={withoutAuth(SignInContainer)} />
        <Route path="/casomeric" component={withAuth(CasomericContainer)} />
        <Route path="/ucastnici" component={withAuth(UcastniciDigestContainer)} />
        <Route path="/prihlasky" component={withAuth(PrihlaseniContainer)} />
        <Route path="/signout" component={withAuth(SignOutContainer)} />
        <Route path="/about" component={() => <About username={username} />} />
        <Redirect to="/" />
      </Switch>
    </main>
  </div>
);

App.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  username: PropTypes.string
};

export default App;
