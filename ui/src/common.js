/* This file is present two times in the project repository:
   - common/common.js in CommonJS format (understood by Node JS)
   - ui/src/common.js in ES6 format (as required by create-react-app scripts)

   When Node.JS supports MJS modules formats natively, this could be just a single file.
 */

export const PORT_DEV_CLIENT = 3000;
export const PORT_DEV_SERVER = 4000;
export const PLATBA_TYPY = ['hotově', 'převodem', 'složenkou'];

export const API_DELETE_VYKON = 'deleteVykon';
export const API_SAVE_STOPKY = 'saveStopky';
export const API_SAVE_VYKON = 'saveVykon';
export const API_SIGN_IN = 'signIn';
export const API_SIGN_OUT = 'signOut';
export const BROADCAST_STOPKY = 'broadcastStopky';
export const BROADCAST_UCASTNIK = 'broadcastUcastnik';
export const FIND_ALL_ROCNIKY = 'findAllRocniky';
export const FIND_ALL_STOPKY = 'findAllStopky';
export const FIND_ALL_UCASTNICI = 'findAllUcastnici';
export const SAVE_PLATBY = 'savePlatby';
export const SAVE_PRIHLASKA = 'savePrihlaska';
export const SAVE_UBYTOVANI = 'saveUbytovani';
export const SAVE_UCAST = 'saveUcast';
export const SAVE_UDAJE = 'saveUdaje';
export const SAVE_VYKON = API_SAVE_VYKON;

export const CODE_OK = 'ok';
export const CODE_ALREADY_EXISTING = 'již existuje';
export const CODE_DB_DISCONNECTED = 'nepřipojeno k databázi';
export const CODE_DUPLICIT_START_CISLO = 'duplicitní startovní číslo';
export const CODE_KATEGORIE_INVALID = 'chybná kategorie';
export const CODE_MAX_LOGIN_ATTEMPTS = 'max login attempts reached';
export const CODE_MLADISTVY_UCASTNIK = 'účastník potřebuje souhlas zákonného zástupce';
export const CODE_NONCE_MISMATCH = 'nesouhlas jednorázového přihlašovacího kódu';
export const CODE_NONEXISTING = 'neexistuje';
export const CODE_PASSWORD_INCORRECT = 'password incorrect';
export const CODE_TOKEN_INVALID = 'authentication token invalid';
export const CODE_UNFULFILLED_REQUEST = 'unfulfilled request';
export const CODE_UNPARSEABLE_MESSAGE = 'unparseable message';
export const CODE_UNRECOGNIZED_ACTION = 'unrecognized action';

export const apiCall = ({ endpoint, request, token }) => ({ action: endpoint, request, token });

export const findAllRocniky = token => ({
  action: FIND_ALL_ROCNIKY,
  request: undefined,
  token
});

export const findAllStopky = token => ({
  action: FIND_ALL_STOPKY,
  request: undefined,
  token
});

export const findAllUcastnici = token => ({
  action: FIND_ALL_UCASTNICI,
  request: undefined,
  token
});

export const savePlatby = ({ id, rok, platby }, token) => ({
  action: SAVE_PLATBY,
  request: { id, rok, platby },
  token
});

export const savePrihlaska = ({ id, rok, prihlaska }, token) => ({
  action: SAVE_PRIHLASKA,
  request: { id, rok, prihlaska },
  token
});

export const saveUbytovani = ({ id, rok, ubytovani }, token) => ({
  action: SAVE_UBYTOVANI,
  request: { id, rok, ubytovani },
  token
});

export const saveUcast = (
  { id, rok, udaje, prihlaska, vykon, platby, ubytovani, poznamka },
  token
) => ({
  action: SAVE_UCAST,
  request: { id, rok, udaje, prihlaska, vykon, platby, ubytovani, poznamka },
  token
});

export const saveUdaje = ({ id, rok, udaje }, token) => ({
  action: SAVE_UDAJE,
  request: { id, rok, udaje },
  token
});

const zkontrolujMladistvy = (kategorie, { datum, narozeni, mladistvyPotvrzen }) => {
  if (!kategorie.vek) {
    return { kategorie, code: CODE_OK };
  }

  const PLNOLETOST = 18;
  const plnoletost = new Date(
    Date.UTC(narozeni.rok + PLNOLETOST, (narozeni.mesic || 1) - 1, narozeni.den || 0)
  );
  if (plnoletost > datum && !mladistvyPotvrzen) {
    return { kategorie: null, code: CODE_MLADISTVY_UCASTNIK };
  }

  return { kategorie, code: CODE_OK };
};

const filtrujPodleVeku = (kategorie, { rok, datum, narozeni }) =>
  kategorie.filter(item => {
    if (item.vek.presne) {
      const horniHranice = new Date(
        Date.UTC(narozeni.rok + item.vek.max + 1, (narozeni.mesic || 1) - 1, narozeni.den || 0)
      );
      if (horniHranice < datum) {
        return true;
      }
      return false;
    }

    const vek = rok - narozeni.rok;
    return item.vek.min <= vek && vek <= item.vek.max;
  });

export const findKategorie = (rocniky, { rok, typ, pohlavi, narozeni, mladistvyPotvrzen }) => {
  const rocnik = rocniky[rok];
  if (!rocnik) {
    return { kategorie: null, code: CODE_NONEXISTING, status: `Ročník pro ${rok} neexistuje.` };
  }

  const typKategorie = rocnik.kategorie[typ];
  if (!typKategorie) {
    return {
      kategorie: null,
      code: CODE_NONEXISTING,
      status: `Kategorie '${typ}' v roce ${rok} neexistuje.`
    };
  }

  if (!typKategorie['muž'] && !typKategorie['žena']) {
    // jediná kategorie
    return zkontrolujMladistvy(typKategorie, {
      datum: new Date(rocnik.datum),
      narozeni,
      mladistvyPotvrzen
    });
  }

  const spravnePohlavi = typKategorie[pohlavi];
  if (!spravnePohlavi) {
    return {
      kategorie: null,
      code: CODE_NONEXISTING,
      status: `Kategorie '${typ}' v roce ${rok} neexistuje pro pohlaví '${pohlavi}'.`
    };
  }

  if (spravnePohlavi.length === 1) {
    return zkontrolujMladistvy(spravnePohlavi[0], {
      datum: new Date(rocnik.datum),
      narozeni,
      mladistvyPotvrzen
    });
  }

  if (!narozeni.rok) {
    return {
      kategorie: null,
      code: CODE_NONEXISTING,
      status: 'Nevyplněné datum narození (je potřeba alespoň rok).'
    };
  }

  const vek = rok - narozeni.rok;
  const spravnyVek = filtrujPodleVeku(spravnePohlavi, {
    rok,
    datum: new Date(rocnik.datum),
    narozeni
  });
  if (spravnyVek.length === 2 && spravnyVek[0].vek.presne) {
    spravnyVek.pop();
  }

  if (spravnyVek.length === 1) {
    return zkontrolujMladistvy(spravnyVek[0], {
      datum: new Date(rocnik.datum),
      narozeni,
      mladistvyPotvrzen
    });
  }

  if (spravnyVek.length === 0) {
    if (vek <= spravnePohlavi[0].vek.max) {
      return zkontrolujMladistvy(spravnePohlavi[0], {
        datum: new Date(rocnik.datum),
        narozeni,
        mladistvyPotvrzen
      });
    }
    return { kategorie: spravnePohlavi[spravnePohlavi.length - 1], code: CODE_OK };
  }

  return {
    kategorie: null,
    code: CODE_NONEXISTING,
    status: `Pro '${pohlavi}' - '${typ}' v roce ${rok} a věk ${vek} let jsem našel více kategorií.`
  };
};

export const ubytovaniPrihlasit = ({ den, ubytovani = {} }) => ({
  ...ubytovani,
  [den]: { ...ubytovani[den], prihlaseno: true }
});
export const ubytovaniOdhlasit = ({ den, ubytovani = {} }) => {
  const { [den]: remove, ...rest } = ubytovani;
  return rest;
};
export const ubytovaniPrespano = ({ den, ubytovani = {} }) => ({
  ...ubytovani,
  [den]: { ...ubytovani[den], prespano: true }
});
export const ubytovaniNeprespano = ({ den, ubytovani = {} }) => ({
  ...ubytovani,
  [den]: { ...ubytovani[den], prespano: false }
});
