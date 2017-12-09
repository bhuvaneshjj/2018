export const initialState = { allIds: [], byIds: {} };

const ucastniciReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RECEIVE_UCASTNICI':
      return action.ucastnici;
    default:
      return state;
  }
};

export default ucastniciReducer;

// Forces 'null' to be the last (desc = false) or first (desc = true).
// Note that 'undefined' is never passed to the sort method (virtue of Array.prototype.sort).
export const narozeniSortMethod = (a, b, desc = false) => {
  if (a && b) {
    if (a.rok < b.rok) {
      return -1;
    }
    if (a.rok > b.rok) {
      return +1;
    }

    if (a.mesic && b.mesic) {
      if (a.mesic < b.mesic) {
        return -1;
      }
      if (a.mesic > b.mesic) {
        return +1;
      }

      if (a.den && b.den) {
        if (a.den < b.den) {
          return -1;
        }
        if (a.den > b.den) {
          return +1;
        }
        return 0; // a tie
      }

      if (!a.den && !b.den) {
        return 0; // both null or undefined
      }
      if (a.den) {
        return desc ? +1 : -1;
      }
      return desc ? -1 : +1;
    }

    if (!a.mesic && !b.mesic) {
      return 0; // both null or undefined
    }
    if (a.mesic) {
      return desc ? +1 : -1;
    }
    return desc ? -1 : +1;
  }

  if (!a && !b) {
    return 0; // both null
  }
  if (a) {
    return desc ? +1 : -1;
  }
  return desc ? -1 : +1;
};

export const getUcastniciOverviewSorted = ({ allIds, byIds }) => {
  const ucastnici = [];
  allIds.forEach(id => {
    const ucastnik = byIds[id];
    const posledniUcast = ucastnik[ucastnik.roky[0]];

    ucastnici.push({
      id,
      prijmeni: posledniUcast.udaje.prijmeni,
      jmeno: posledniUcast.udaje.jmeno,
      narozeni: posledniUcast.udaje.narozeni
    });
  });

  const collator = new Intl.Collator('cs');
  return ucastnici.sort((a, b) => {
    const prijmeniCmp = collator.compare(a.prijmeni, b.prijmeni);
    if (prijmeniCmp !== 0) {
      return prijmeniCmp;
    }

    const jmenoCmp = collator.compare(a.jmeno, b.jmeno);
    if (jmenoCmp !== 0) {
      return jmenoCmp;
    }

    return narozeniSortMethod(a, b);
  });
};
