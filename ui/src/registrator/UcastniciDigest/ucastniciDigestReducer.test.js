import deepFreeze from 'deep-freeze';
import ucastniciDigestReducer, {
  SortDirTypes,
  getUcastniciDigestSorted
} from './ucastniciDigestReducer';
import sortDirChange from './UcastniciDigestActions';

it('na začátku', () => {
  const stateBefore = undefined;

  const stateAfter = ucastniciDigestReducer(stateBefore, {});
  expect(stateAfter.sortColumn).toBe(undefined);
  expect(stateAfter.sortDir).toEqual(SortDirTypes.NONE);
});

it('řadit dle příjmení vzestupně', () => {
  const stateBefore = { sortColumn: undefined, sortDir: SortDirTypes.NONE };
  const stateAfter = { sortColumn: 'prijmeni', sortDir: SortDirTypes.ASC };
  deepFreeze(stateBefore);

  expect(ucastniciDigestReducer(stateBefore, sortDirChange('prijmeni'))).toEqual(stateAfter);
});

it('řadit dle příjmení sestupně', () => {
  const stateBefore = { sortColumn: 'prijmeni', sortDir: SortDirTypes.ASC };
  const stateAfter = { sortColumn: 'prijmeni', sortDir: SortDirTypes.DESC };
  deepFreeze(stateBefore);

  expect(ucastniciDigestReducer(stateBefore, sortDirChange('prijmeni'))).toEqual(stateAfter);
});

it('řadit dle jména vzestupně', () => {
  const stateBefore = { sortColumn: 'prijmeni', sortDir: SortDirTypes.ASC };
  const stateAfter = { sortColumn: 'jmeno', sortDir: SortDirTypes.ASC };
  deepFreeze(stateBefore);

  expect(ucastniciDigestReducer(stateBefore, sortDirChange('jmeno'))).toEqual(stateAfter);
});

it('getUcastniciDigestSorted() by default', () => {
  const state = {
    ucastnici: {
      allIds: ['6f09b1fd371dec1e99b7e1c9', '5a09b1fd371dec1e99b7e1c9'],
      byIds: {
        '6f09b1fd371dec1e99b7e1c9': {
          roky: [2016],
          2016: {
            udaje: {
              prijmeni: 'Sukdoláková',
              jmeno: 'Martina',
              narozeni: { rok: 1963, mesic: 12, den: 7 },
              pohlavi: 'zena',
              obec: 'Zlín',
              stat: 'Česká republika'
            }
          }
        },
        '5a09b1fd371dec1e99b7e1c9': {
          roky: [2018, 2017],
          2018: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1956 },
              pohlavi: 'muz',
              obec: 'Ostrava 2',
              stat: 'Česká republika'
            }
          },
          2017: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1957 },
              pohlavi: 'muz',
              obec: 'Ostrava 1',
              stat: 'Česká republika'
            }
          }
        }
      }
    },
    registrator: {
      ucastniciDigest: {
        sortColumn: undefined,
        sortDir: undefined
      }
    }
  };
  const selected = [
    {
      id: '5a09b1fd371dec1e99b7e1c9',
      prijmeni: 'Balabák',
      jmeno: 'Roman',
      narozeni: '1956'
    },
    {
      id: '6f09b1fd371dec1e99b7e1c9',
      prijmeni: 'Sukdoláková',
      jmeno: 'Martina',
      narozeni: '7. 12. 1963'
    }
  ];
  deepFreeze(state);

  const { ucastnici, registrator } = state;
  expect(getUcastniciDigestSorted({ ...ucastnici, ...registrator.ucastniciDigest })).toEqual(
    selected
  );
});

it('getUcastniciDigestSorted() podle příjmení sestupně', () => {
  const state = {
    ucastnici: {
      allIds: ['6f09b1fd371dec1e99b7e1c9', '5a09b1fd371dec1e99b7e1c9'],
      byIds: {
        '6f09b1fd371dec1e99b7e1c9': {
          roky: [2016],
          2016: {
            udaje: {
              prijmeni: 'Sukdoláková',
              jmeno: 'Martina',
              narozeni: { rok: 1963, mesic: 12, den: 7 },
              pohlavi: 'zena',
              obec: 'Zlín',
              stat: 'Česká republika'
            }
          }
        },
        '5a09b1fd371dec1e99b7e1c9': {
          roky: [2018, 2017],
          2018: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1956 },
              pohlavi: 'muz',
              obec: 'Ostrava 2',
              stat: 'Česká republika'
            }
          },
          2017: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1957 },
              pohlavi: 'muz',
              obec: 'Ostrava 1',
              stat: 'Česká republika'
            }
          }
        }
      }
    },
    registrator: {
      ucastniciDigest: {
        sortColumn: 'prijmeni',
        sortDir: SortDirTypes.DESC
      }
    }
  };
  const selected = [
    {
      id: '6f09b1fd371dec1e99b7e1c9',
      prijmeni: 'Sukdoláková',
      jmeno: 'Martina',
      narozeni: '7. 12. 1963'
    },
    {
      id: '5a09b1fd371dec1e99b7e1c9',
      prijmeni: 'Balabák',
      jmeno: 'Roman',
      narozeni: '1956'
    }
  ];
  deepFreeze(state);

  const { ucastnici, registrator } = state;
  expect(getUcastniciDigestSorted({ ...ucastnici, ...registrator.ucastniciDigest })).toEqual(
    selected
  );
});

it('getUcastniciDigestSorted() podle narození sestupně', () => {
  const state = {
    ucastnici: {
      allIds: ['6f09b1fd371dec1e99b7e1c9', '5a09b1fd371dec1e99b7e1c9'],
      byIds: {
        '6f09b1fd371dec1e99b7e1c9': {
          roky: [2016],
          2016: {
            udaje: {
              prijmeni: 'Sukdoláková',
              jmeno: 'Martina',
              narozeni: { rok: 1963, mesic: 12, den: 7 },
              pohlavi: 'zena',
              obec: 'Zlín',
              stat: 'Česká republika'
            }
          }
        },
        '5a09b1fd371dec1e99b7e1c9': {
          roky: [2018, 2017],
          2018: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1956 },
              pohlavi: 'muz',
              obec: 'Ostrava 2',
              stat: 'Česká republika'
            }
          },
          2017: {
            udaje: {
              prijmeni: 'Balabák',
              jmeno: 'Roman',
              narozeni: { rok: 1957 },
              pohlavi: 'muz',
              obec: 'Ostrava 1',
              stat: 'Česká republika'
            }
          }
        }
      }
    },
    registrator: {
      ucastniciDigest: {
        sortColumn: 'narozeni',
        sortDir: SortDirTypes.DESC
      }
    }
  };
  const selected = [
    {
      id: '6f09b1fd371dec1e99b7e1c9',
      prijmeni: 'Sukdoláková',
      jmeno: 'Martina',
      narozeni: '7. 12. 1963'
    },
    {
      id: '5a09b1fd371dec1e99b7e1c9',
      prijmeni: 'Balabák',
      jmeno: 'Roman',
      narozeni: '1956'
    }
  ];
  deepFreeze(state);

  const { ucastnici, registrator } = state;
  expect(getUcastniciDigestSorted({ ...ucastnici, ...registrator.ucastniciDigest })).toEqual(
    selected
  );
});
