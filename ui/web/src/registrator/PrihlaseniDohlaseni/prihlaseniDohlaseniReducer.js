import { AKTUALNI_ROK, ActionPrefixes } from '../../constants';
import { sortForColumn } from '../../sort';
import { getDatumKonani } from '../../entities/rocniky/rocnikyReducer';
import { getUcastiProRok } from '../../entities/ucastnici/ucastniciReducer';
import { predepsaneStartovne, provedenePlatby } from '../platby';
import {
  createFilterableReducer,
  initialState as filterableInitialState
} from '../Filterable/filterableReducer';
import {
  createUcastniciTableReducer,
  initialState as ucastniciTableInitialState
} from '../UcastniciTable/ucastniciTableReducer';

export const initialState = {
  dohlaseniFilter: false,
  prihlaseniFilter: false,
  showingPoznamkyFor: undefined /* id účastníka */,
  ...filterableInitialState,
  ...ucastniciTableInitialState
};

export const createPrihlaseniDohlaseniReducer = actionPrefix => {
  const filterableReducer = createFilterableReducer(actionPrefix);
  const ucastniciTableReducer = createUcastniciTableReducer(actionPrefix);

  const dohlaseniFilter = actionPrefix === ActionPrefixes.DOHLASENI;
  const prihlaseniFilter = actionPrefix === ActionPrefixes.PRIHLASENI;

  return (state = { ...initialState, dohlaseniFilter, prihlaseniFilter }, action) => {
    state = filterableReducer(state, action); // eslint-disable-line no-param-reassign
    state = ucastniciTableReducer(state, action); // eslint-disable-line no-param-reassign

    switch (action.type) {
      case `${actionPrefix}_DOHLASENI_FILTER_CHANGE`:
        return { ...state, dohlaseniFilter: !state.dohlaseniFilter };
      case `${actionPrefix}_PRIHLASENI_FILTER_CHANGE`:
        return { ...state, prihlaseniFilter: !state.prihlaseniFilter };
      case `${actionPrefix}_SHOW_POZNAMKY`:
        return { ...state, showingPoznamkyFor: action.id };
      case `${actionPrefix}_HIDE_POZNAMKY`:
        return { ...state, showingPoznamkyFor: undefined };
      default:
        return state;
    }
  };
};

export const getPrihlaseniDohlaseniSorted = ({
  dohlaseniFilter,
  prihlaseniFilter,
  kategorieFilter,
  textFilter,
  sortColumn,
  sortDir,
  kategorie,
  rocniky,
  ucastnici,
  rok = AKTUALNI_ROK
}) => {
  const datumKonani = getDatumKonani({ rocniky, rok });

  const ucasti = getUcastiProRok({ rok, ucastnici });
  const mapped = ucasti.map(jeden => {
    const { id, ucast } = jeden;
    const {
      udaje: { prijmeni, jmeno, narozeni, obec, email },
      prihlaska,
      platby,
      poznamky
    } = ucast;
    const { datum, kategorie: kategorieId, startCislo, kod } = prihlaska;
    const jednaKategorie = kategorie[kategorieId];
    const predepsano = predepsaneStartovne({ kategorie, prihlaska, rocniky, rok }).suma;
    const zaplaceno = provedenePlatby(platby).suma;

    return {
      id,
      platby,
      prijmeni,
      jmeno,
      narozeni,
      obec,
      email: email || '',
      datum: new Date(datum),
      kategorie: jednaKategorie,
      startCislo,
      kod,
      predepsano,
      zaplaceno,
      nejakaPoznamka: (poznamky && poznamky.length > 0) || false
    };
  });

  const afterTextFilter = mapped.filter(
    ({ jmeno, prijmeni }) =>
      prijmeni.toLowerCase().startsWith(textFilter) || jmeno.toLowerCase().startsWith(textFilter)
  );

  const afterKategorieFilter = afterTextFilter.filter(
    ({ kategorie: jednaKategorie }) =>
      kategorieFilter === '' || kategorieFilter === jednaKategorie.typ
  );

  const afterPrihlaseniFilter = prihlaseniFilter
    ? afterKategorieFilter.filter(
        ({ datum }) => new Date(datum).getTime() < new Date(datumKonani).getTime()
      )
    : afterKategorieFilter;

  const afterDohlaseniFilter = dohlaseniFilter
    ? afterPrihlaseniFilter.filter(
        ({ datum, platby }) =>
          new Date(datum).getTime() >= new Date(datumKonani).getTime() ||
          platby.filter(
            ({ datum: datumPlatby }) =>
              new Date(datumPlatby).getTime() >= new Date(datumKonani).getTime()
          ).length > 0
      )
    : afterPrihlaseniFilter;

  const final = afterDohlaseniFilter.map(({ platby, ...rest }) => rest);

  return sortForColumn({ data: final, sortColumn, sortDir });
};