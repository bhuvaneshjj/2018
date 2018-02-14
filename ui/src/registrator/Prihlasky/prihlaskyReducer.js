import moment from 'moment';
import { findKategorie, CODE_OK, PLATBA_TYPY } from '../../common';
import { AKTUALNI_ROK, TYPY_KATEGORII } from '../../constants';
import { narozeniToStr } from '../../Util';
import { getTypKategorie } from '../../entities/rocniky/rocnikyReducer';
import { prijmeniJmenoNarozeniSortMethod } from '../../entities/ucastnici/ucastniciReducer';

const initialState = {
  errorCode: '',
  errorMessage: '',
  showError: false,
  fetching: false,
  saved: false,
  saving: false,
  ucastnikId: undefined,
  validateForm: false,
  validatePlatba: false,
  udaje: {
    prijmeni: undefined,
    jmeno: undefined,
    narozeni: { den: undefined, mesic: undefined, rok: undefined },
    pohlavi: undefined,
    adresa: undefined,
    obec: undefined,
    psc: undefined,
    stat: 'Česká republika',
    klub: undefined,
    email: undefined,
    telefon: undefined
  },
  prihlaska: {
    datum: undefined,
    kategorie: undefined,
    typ: undefined,
    startCislo: undefined,
    kod: undefined,
    mladistvyPotvrzen: undefined
  },
  platby: [],
  novaPlatba: { castka: undefined, datum: undefined, typ: PLATBA_TYPY[0], poznamka: undefined }
};

const validFormats = ['D.M.YYYY', 'D. M. YYYY', moment.ISO_8601];

const parseNarozeni = value => {
  if (value === undefined) {
    return { den: undefined, mesic: undefined, rok: undefined };
  }

  const split = value.split('.');
  if (split.length !== 3) {
    if (moment(value, 'YYYY', true).isValid()) {
      return { den: undefined, mesic: undefined, rok: moment(value, 'YYYY').year() };
    }
    return { den: undefined, mesic: undefined, rok: value };
  }

  const den = split[0] && split[0].trim();
  const mesic = split[1] && split[1].trim();
  const rok = split[2] && split[2].trim();
  const maybeParsed = moment(`${den}.${mesic}.${rok}`, validFormats[0], true);
  if (maybeParsed.isValid()) {
    return { den: maybeParsed.date(), mesic: maybeParsed.month() + 1, rok: maybeParsed.year() };
  }
  return { den: undefined, mesic: undefined, rok: value };
};

const datumValid = value => validFormats.some(format => moment(value, format, true).isValid());

const parseDatum = value =>
  validFormats.reduce((accumulator, format) => {
    if (!accumulator && moment(value, format, true).isValid()) {
      return moment.utc(value, format, true).toJSON();
    }
    return accumulator;
  }, undefined) || value;

const prihlaskyReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PRIHLASKY_HIDE_ERROR':
      return { ...state, showError: false };
    case 'PRIHLASKY_INPUT_CHANGED': {
      const [section, name] = action.name.split('.');
      let { value } = action;
      switch (action.name) {
        case 'udaje.prijmeni':
          if (value.endsWith('ová') && state.udaje.pohlavi === undefined) {
            // eslint-disable-next-line no-param-reassign
            state = { ...state, udaje: { ...state.udaje, pohlavi: 'žena' } };
          }
          break;
        case 'udaje.narozeni':
          value = parseNarozeni(action.value);
          break;
        case 'prihlaska.datum':
        case 'novaPlatba.datum':
          value = parseDatum(action.value);
          break;
        case 'prihlaska.typ':
          // eslint-disable-next-line no-param-reassign
          state = { ...state, prihlaska: { ...state.prihlaska, kategorie: action.id } };
          break;
        default:
          break;
      }
      return { ...state, [section]: { ...state[section], [name]: value } };
    }
    case 'PRIHLASKY_UCASTNIK_SELECTED':
      return {
        ...initialState,
        ucastnikId: action.id,
        udaje: action.udaje,
        prihlaska: action.prihlaska ? action.prihlaska : initialState.prihlaska,
        platby: action.platby ? action.platby : initialState.platby
      };
    case 'PRIHLASKY_RESET':
      return initialState;
    case 'PRIHLASKY_VALIDATE_FORM':
      return { ...state, validateForm: true };
    case 'PRIHLASKY_VALIDATE_PLATBA':
      return { ...state, validatePlatba: true };
    case 'PRIHLASKY_FORM_INVALID':
      return {
        ...state,
        showError: true,
        errorCode: action.code,
        errorMessage: action.status
      };
    case 'PRIHLASKY_SAVE_REQUEST':
      return { ...state, saving: true };
    case 'PRIHLASKY_SAVE_SUCCESS':
      return { ...state, ucastnikId: action.id, saving: false, showError: false };
    case 'PRIHLASKY_SAVE_ERROR':
      return {
        ...state,
        saving: false,
        errorCode: action.code,
        errorMessage: action.status,
        showError: true
      };
    case 'PRIHLASKY_SAVE_SHOW_MODAL':
      return { ...state, saved: true };
    case 'PRIHLASKY_SAVE_HIDE_MODAL':
      return { ...state, saved: false };
    case 'PRIHLASKY_ADD_PLATBA': {
      const { castka, ...novaPlatba } = state.novaPlatba;
      const platby = [...state.platby, { castka: parseInt(castka, 10), ...novaPlatba }];
      platby.sort((a, b) => moment.utc(a.datum) - moment.utc(b.datum));
      return {
        ...state,
        validatePlatba: false,
        platby,
        novaPlatba: initialState.novaPlatba
      };
    }
    case 'PRIHLASKY_REMOVE_PLATBA':
      return {
        ...state,
        platby: [...state.platby.slice(0, action.idx), ...state.platby.slice(action.idx + 1)]
      };
    case 'FETCH_UCASTNICI_REQUEST':
      return { ...state, fetching: true };
    case 'FETCH_UCASTNICI_SUCCESS':
    case 'FETCH_UCASTNICI_ERROR':
      return { ...state, fetching: false };
    default:
      return state;
  }
};

export default prihlaskyReducer;

const nonEmptyInputValid = (value, validateForm) => {
  if (value === undefined) {
    if (validateForm) {
      return 'error';
    }
    return undefined;
  } else if (!value) {
    return 'error';
  }
  return 'success';
};

const narozeniValid = (value, validateForm, requireDenMesic) => {
  const { den, mesic, rok } = value;
  if (den === undefined && mesic === undefined && rok === undefined) {
    if (validateForm) {
      return 'error';
    }
    return undefined;
  }

  if (den === undefined && mesic === undefined) {
    if (requireDenMesic) {
      return 'error';
    }

    if (moment(rok, 'YYYY', true).isValid()) {
      return 'warning';
    }
    return 'error';
  }

  if (moment(`${den}.${mesic}.${rok}`, 'D.M.YYYY', true).isValid()) {
    return 'success';
  }
  return 'error';
};

const numberValid = (value, validatePlatba) => {
  if (value === undefined && !validatePlatba) {
    return undefined;
  }

  const cislo = parseInt(value, 10);
  return Number.isNaN(cislo) ? 'error' : 'success';
};

export const inputValid = (name, value, prihlasky) => {
  switch (name) {
    case 'udaje.prijmeni':
    case 'udaje.jmeno':
    case 'udaje.pohlavi':
    case 'udaje.obec':
    case 'udaje.stat':
    case 'prihlaska.kategorie':
    case 'prihlaska.typ':
      return nonEmptyInputValid(value, prihlasky.validateForm);
    case 'udaje.adresa':
    case 'udaje.klub':
    case 'udaje.email':
    case 'udaje.telefon':
    case 'prihlaska.startCislo': // Může nechat nevyplněné, doplní se později.
    case 'prihlaska.kod':
    case 'prihlaska.mladistvyPotvrzen':
    case 'novaPlatba.poznamka':
      return undefined;
    case 'udaje.narozeni':
      // TODO: kategorie presne => den + mesic required === true
      return narozeniValid(value, prihlasky.validateForm, false);
    case 'udaje.psc':
      if (prihlasky.udaje.stat === 'Česká republika') {
        return nonEmptyInputValid(value, prihlasky.validateForm);
      }
      return undefined;
    case 'prihlaska.datum':
      if (value === undefined) {
        if (prihlasky.validateForm) {
          return 'error';
        }
        return undefined;
      }
      return datumValid(value) ? 'success' : 'error';
    case 'novaPlatba.castka':
      return numberValid(value, prihlasky.validatePlatba);
    case 'novaPlatba.datum':
      if (value === undefined) {
        if (prihlasky.validatePlatba) {
          return 'error';
        }
        return undefined;
      }
      return datumValid(value) ? 'success' : 'error';
    case 'novaPlatba.typ':
      if (value === undefined && !prihlasky.validatePlatba) {
        return undefined;
      }
      return PLATBA_TYPY.includes(value) ? 'success' : 'error';
    default:
      return 'error';
  }
};

const isInputValid = (name, value, prihlasky) => {
  const validationState = inputValid(name, value, prihlasky);
  if (
    validationState === undefined ||
    validationState === 'success' ||
    validationState === 'warning'
  ) {
    return true;
  }
  return false;
};

export const formValid = prihlasky => {
  const { udaje, prihlaska } = prihlasky;

  return (
    isInputValid('udaje.prijmeni', udaje.prijmeni, prihlasky) &&
    isInputValid('udaje.jmeno', udaje.jmeno, prihlasky) &&
    isInputValid('udaje.narozeni', udaje.narozeni, prihlasky) &&
    isInputValid('udaje.pohlavi', udaje.pohlavi, prihlasky) &&
    isInputValid('udaje.obec', udaje.obec, prihlasky) &&
    isInputValid('udaje.psc', udaje.psc, prihlasky) &&
    isInputValid('udaje.stat', udaje.stat, prihlasky) &&
    isInputValid('prihlaska.datum', prihlaska.datum, prihlasky) &&
    isInputValid('prihlaska.kategorie', prihlaska.kategorie, prihlasky) &&
    isInputValid('prihlaska.typ', prihlaska.typ, prihlasky)
  );
};

export const novaPlatbaValid = prihlasky => {
  const { novaPlatba } = prihlasky;

  return (
    isInputValid('novaPlatba.castka', novaPlatba.castka, prihlasky) &&
    isInputValid('novaPlatba.datum', novaPlatba.datum, prihlasky) &&
    isInputValid('novaPlatba.typ', novaPlatba.typ, prihlasky) &&
    isInputValid('novaPlatba.poznamka', novaPlatba.poznamka, prihlasky)
  );
};

export const isInputEnabled = (name, prihlasky, rocniky) => {
  switch (name) {
    case 'prihlaska.startCislo': {
      const { typ } = prihlasky.prihlaska;
      if (!typ) {
        return false;
      }
      const typKategorieRocniku = getTypKategorie({ rok: AKTUALNI_ROK, typ, rocniky });
      return !!typKategorieRocniku.startCisla;
    }
    default:
      return true;
  }
};

export const inputOptions = (name, prihlasky, rocniky, ucastnici) => {
  switch (name) {
    case 'udaje.prijmeni+prihlaska.kod': {
      const selected = ucastnici.allIds.map(id => {
        const ucastnik = ucastnici.byIds[id];
        const posledniRok = ucastnik.roky[0];
        const { prijmeni, jmeno, narozeni } = ucastnik[posledniRok].udaje;
        const result = { id, prijmeni, jmeno, narozeni };
        if (ucastnik[AKTUALNI_ROK]) {
          result.kod = ucastnik[AKTUALNI_ROK].prihlaska.kod;
        }
        return result;
      });
      return selected.sort(prijmeniJmenoNarozeniSortMethod);
    }
    case 'udaje.pohlavi':
      return [{ key: 'muž', value: 'muž' }, { key: 'žena', value: 'žena' }];
    case 'prihlaska.typ': {
      const rok = AKTUALNI_ROK;
      const typyKategorii =
        (rocniky.byRoky[rok] && Object.keys(rocniky.byRoky[rok].kategorie)) || TYPY_KATEGORII;

      const list = [];
      typyKategorii.forEach(typ => {
        const found = findKategorie(rocniky.byRoky, {
          rok,
          typ,
          pohlavi: prihlasky.udaje.pohlavi,
          narozeni: prihlasky.udaje.narozeni,
          mladistvyPotvrzen: true
        });
        if (found.code === CODE_OK) {
          const { pohlavi, vek } = found.kategorie;
          list.push({ key: typ, id: found.kategorie.id, value: { pohlavi, typ, vek } });
        } else {
          list.push({ key: typ, value: { typ } });
        }
      });
      return list;
    }
    case 'novaPlatba.typ':
      return PLATBA_TYPY.map(typ => ({ key: typ, value: typ }));
    default:
      return null;
  }
};

export const formatValue = (name, rawValue) => {
  switch (name) {
    case 'udaje.narozeni':
      return narozeniToStr(rawValue);
    case 'prihlaska.datum':
    case 'novaPlatba.datum':
      return datumValid(rawValue) ? moment.utc(rawValue).format('D. M. YYYY') : rawValue || '';
    default:
      return rawValue ? `${rawValue}` : '';
  }
};
