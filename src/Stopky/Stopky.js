import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import './Stopky.css';
import { stopkyStart, stopkyStop } from './StopkyActions';
import Displej from './Displej';

const ONE_TICK = 100; // milliseconds

class Stopky extends Component {
  constructor(props) {
    super(props);
    this.state = { current: new Date() };
  }

  componentWillUnmount() {
    this.stop();
  }

  tick() {
    this.setState({ current: new Date() });
  }

  start() {
    this.timerID = setInterval(() => this.tick(), ONE_TICK);

    const { store } = this.context;
    store.dispatch(stopkyStart(new Date()));
  }

  stop() {
    clearInterval(this.timerID);
    this.timerID = null;

    const { store } = this.context;
    store.dispatch(stopkyStop());
  }

  render = () => {
    const { store } = this.context;
    const state = store.getState();

    let hours, mins, secs, subsecs;
    if (state.base === null) {
      hours = '-';
      mins = '--';
      secs = '--';
      subsecs = '--';
    } else {
      let duration = moment.duration(this.state.current.getTime() - state.base.getTime());
      hours = duration.hours().toString();
      mins = duration.minutes().toString();
      secs = duration.seconds().toString();
      subsecs = duration.milliseconds().toString();
      if (subsecs.length < 2) {
        subsecs = subsecs + '0';
      } else {
        subsecs = subsecs.slice(0, 2);
      }
    }

    return (
      <div className="Stopky">
        <Displej hours={hours} mins={mins} secs={secs} subsecs={subsecs} />
        <Button bsStyle="success" onClick={() => this.start()}>
          Start
        </Button>
        <Button bsStyle="danger" onClick={() => this.stop()}>
          Stop
        </Button>
      </div>
    );
  };
}

Stopky.contextTypes = {
  store: PropTypes.object
};

export default Stopky;
