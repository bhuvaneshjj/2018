import { AKTUALNI_ROK } from '../../constants';
import { sortForColumn } from '../../sort';
import { createFilterableReducer } from '../Filterable/filterableReducer';
import {
  createUcastniciTableReducer,
  initialState as ucastniciTableInitialState
} from '../UcastniciTable/ucastniciTableReducer';

export const initialState = {
  loading: {},
  jenUbytovani: true,
  textFilter: '',
  ...ucastniciTableInitialState
};

const filterableReducer = createFilterableReducer('UBYTOVANI');
const ucastniciTableReducer = createUcastniciTableReducer('UBYTOVANI');

const ubytovaniReducer = (state = initialState, action) => {
  state = filterableReducer(state, action); // eslint-disable-line no-param-reassign
  state = ucastniciTableReducer(state, action); // eslint-disable-line no-param-reassign

  switch (action.type) {
    case 'UBYTOVANI_CHANGE_UBYTOVANI':
      return { ...state, jenUbytovani: !state.jenUbytovani };
    case 'UBYTOVANI_SAVE_REQUEST':
      return { ...state, loading: { ...state.loading, [action.id]: true } };
    case 'UBYTOVANI_SAVE_SUCCESS':
    case 'UBYTOVANI_SAVE_ERROR': {
      const { [action.id]: remove, ...rest } = state.loading;
      return { ...state, loading: rest };
    }
    default:
      return state;
  }
};

export default ubytovaniReducer;

export const getUbytovaniSorted = ({
  ucastnici,
  jenUbytovani,
  textFilter,
  sortColumn,
  sortDir
}) => {
  const rok = AKTUALNI_ROK;
  const result = [];
  ucastnici.allIds.forEach(id => {
    const ucastnik = ucastnici.byIds[id];
    if (ucastnik.roky[0] === rok) {
      const ucast = ucastnik[rok];
      const { udaje: { prijmeni, jmeno, narozeni, obec, email }, prihlaska: { datum } } = ucast;
      const ubytovani = ucast.ubytovani || {};

      if (
        prijmeni.toLowerCase().startsWith(textFilter) ||
        jmeno.toLowerCase().startsWith(textFilter)
      ) {
        if (!jenUbytovani || ubytovani.pátek) {
          const prihlaseno = ubytovani.pátek && ubytovani.pátek.prihlaseno;
          const prespano = ubytovani.pátek && ubytovani.pátek.prespano;

          const akceOptions = ['<vyber>'];
          akceOptions.push(prihlaseno ? 'Odhlásit' : 'Přihlásit');
          if (!prespano) {
            akceOptions.push('Přespáno');
          }
          if (prespano === true || prespano === undefined) {
            akceOptions.push('Nepřespáno');
          }

          result.push({
            id,
            prijmeni,
            jmeno,
            narozeni,
            obec,
            email: email || '',
            datum: new Date(datum),
            prihlaseno,
            prespano,
            akce: { options: akceOptions }
          });
        }
      }
    }
  });

  return sortForColumn({ data: result, sortColumn, sortDir });
};
