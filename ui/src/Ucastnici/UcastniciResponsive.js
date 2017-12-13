import Dimensions from 'react-dimensions';
import PropTypes from 'prop-types';
import Ucastnici from './Ucastnici';

const UcastniciResponsive = Dimensions({
  getHeight: () => window.innerHeight - 100,
  getWidth: () => window.innerWidth - 100,
  containerStyle: {
    paddingLeft: '30px',
    paddingRight: '50px'
  }
})(Ucastnici);

UcastniciResponsive.propTypes = {
  ucastnici: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      prijmeni: PropTypes.string.isRequired,
      jmeno: PropTypes.string.isRequired,
      narozeni: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  fetchUcastnici: PropTypes.func.isRequired
};

export default UcastniciResponsive;