import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon, Modal } from 'react-bootstrap';
import TextInput from '../Input/TextInput';
import VyberStartCislo from './VyberStartCislo';
import './StartCisloInput.css';

const StartCisloInput = ({
  enabled,
  showing,
  typ,
  value,
  vybraneId,
  vybraneStartCislo,
  inputRef,
  onChange,
  onHide,
  onSelect,
  onShow
}) => (
  <React.Fragment>
    <TextInput
      className="StartCisloInput__input"
      enabled={enabled}
      value={value}
      inputRef={inputRef}
      onChange={onChange}
    />
    <Modal keyboard={true} show={showing} onHide={onHide} bsSize="large">
      <Modal.Header closeButton>
        <Modal.Title>Výběr startovního čísla</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <VyberStartCislo
          typ={typ}
          vybraneId={vybraneId}
          vybraneStartCislo={vybraneStartCislo}
          onSelect={onSelect}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="primary" onClick={onHide}>
          Zavřít
        </Button>
      </Modal.Footer>
    </Modal>
    {!showing && (
      <Button
        bsStyle="info"
        className="StartCisloInput__button"
        disabled={!enabled}
        onClick={onShow}
      >
        <Glyphicon glyph="plus" /> Vybrat
      </Button>
    )}
  </React.Fragment>
);

StartCisloInput.propTypes = {
  enabled: PropTypes.bool.isRequired,
  showing: PropTypes.bool.isRequired,
  typ: PropTypes.string.isRequired,
  value: PropTypes.string,
  vybraneId: PropTypes.string,
  vybraneStartCislo: PropTypes.number,
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onShow: PropTypes.func.isRequired
};

export default StartCisloInput;