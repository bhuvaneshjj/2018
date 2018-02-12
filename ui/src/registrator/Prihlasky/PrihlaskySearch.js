import React from 'react';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import './PrihlaskySearch.css';

const stripDiactrics = string => string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isMatch = (option, text) => {
  const { prijmeni, kod } = option;

  const prijmeniLower = stripDiactrics(prijmeni.toLowerCase());
  const textLower = stripDiactrics(text.toLowerCase());

  return prijmeniLower.startsWith(textLower) || kod === text;
};

const PrihlaskySearch = ({ options, onSelect }) => (
  <Typeahead
    className="PrihlaskySearch"
    labelKey="prijmeni"
    options={options}
    minLength={1}
    highlightOnlyResult={true}
    selectHintOnEnter={true}
    placeholder="Začni psát příjmení nebo vlož kód přihlášky."
    emptyLabel="Nic nenalezeno."
    autoComplete={false}
    filterBy={isMatch}
    onChange={results => {
      if (results.length >= 1) {
        // Typeahead provides an array so take the first result.
        onSelect(results[0]);
      }
    }}
    renderMenuItemChildren={option => {
      const { prijmeni, jmeno, narozeni } = option;
      return `${prijmeni} ${jmeno}, ${narozeni.rok}`;
    }}
  />
);

PrihlaskySearch.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      prijmeni: PropTypes.string.isRequired,
      jmeno: PropTypes.string.isRequired,
      narozeni: PropTypes.shape({
        rok: PropTypes.number.isRequired
      }).isRequired,
      kod: PropTypes.string
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired
};

export default PrihlaskySearch;
