import { narozeniToStr, SortDirTypes } from '../../Util';
import {
  csStringSortMethod,
  narozeniSortMethod,
  prijmeniJmenoNarozeniSortMethod
} from '../../entities/ucastnici/ucastniciReducer';
import {
  createFilterableReducer,
  initialState as filterableInitialState
} from '../Filterable/filterableReducer';
import {
  createUcastniciTableReducer,
  initialState as ucastniciTableInitialState
} from '../UcastniciTable/ucastniciTableReducer';

export const initialState = {
  fetching: false,
  ...filterableInitialState,
  ...ucastniciTableInitialState
};

const filterableReducer = createFilterableReducer('UCASTNICI_DIGEST');
const ucastniciTableReducer = createUcastniciTableReducer('UCASTNICI_DIGEST');

const ucastniciDigestReducer = (state = initialState, action) => {
  state = filterableReducer(state, action); // eslint-disable-line no-param-reassign
  state = ucastniciTableReducer(state, action); // eslint-disable-line no-param-reassign
  switch (action.type) {
    case 'FETCH_UCASTNICI_REQUEST':
      return { ...state, fetching: true };
    case 'FETCH_UCASTNICI_SUCCESS':
    case 'FETCH_UCASTNICI_ERROR':
      return { ...state, fetching: false };
    default:
      return state;
  }
};

export default ucastniciDigestReducer;

export const getVykony = (kategorie, ucastnik) => {
  const vykony = {};
  const typyKategorie = {};

  ucastnik.roky.forEach(rok => {
    const { vykon } = ucastnik[rok];
    if (vykon) {
      const typKategorie = kategorie[vykon.kategorie].typ;
      vykony[rok] = {
        kategorie: typKategorie,
        dokonceno: vykon.dokonceno
      };
      // Mark this particular typKategorie in typyKategorie dictionary.
      typyKategorie[typKategorie] = typKategorie;
    }
  });

  return { vykony, typyKategorie };
};

export const getUcastniciDigestSorted = ({
  kategorie,
  ucastnici,
  kategorieFilter,
  textFilter,
  sortColumn,
  sortDir
}) => {
  const result = [];
  ucastnici.allIds.forEach(id => {
    const ucastnik = ucastnici.byIds[id];
    const posledniUcast = ucastnik[ucastnik.roky[0]];
    const { udaje } = posledniUcast;

    if (
      udaje.prijmeni.toLowerCase().startsWith(textFilter) ||
      udaje.jmeno.toLowerCase().startsWith(textFilter)
    ) {
      const { vykony, typyKategorie } = getVykony(kategorie, ucastnik);
      typyKategorie[''] = true; // empty filter means a match as well
      if (typyKategorie[kategorieFilter]) {
        result.push({
          id,
          prijmeni: udaje.prijmeni,
          jmeno: udaje.jmeno,
          narozeni: udaje.narozeni,
          ...vykony
        });
      }
    }
  });

  const sortMethods = {
    prijmeni: (a, b) => csStringSortMethod(a.prijmeni, b.prijmeni),
    jmeno: (a, b) => csStringSortMethod(a.jmeno, b.jmeno),
    narozeni: (a, b) => narozeniSortMethod(a.narozeni, b.narozeni)
  };

  const sortMethod = sortMethods[sortColumn] || prijmeniJmenoNarozeniSortMethod;
  const sorted = result.sort(sortMethod);
  if (sortDir === SortDirTypes.DESC) {
    sorted.reverse();
  }

  return sorted.map(ucastnik => {
    const { narozeni, ...ostatek } = ucastnik;
    return { ...ostatek, narozeni: narozeniToStr(narozeni) };
  });
};
