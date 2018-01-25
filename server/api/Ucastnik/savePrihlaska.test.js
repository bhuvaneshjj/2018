'use strict';

const db = require('../../db');
const Actions = require('../../../common/common');
const createWsServer = require('../../createWsServer');
const createWsClient = require('./../createWsClient');
const Kategorie = require('../../model/Kategorie/Kategorie');
const Rocnik = require('../../model/Rocnik/Rocnik');
const Ucastnik = require('../../model/Ucastnik/Ucastnik');
const generateTestToken = require('../generateTestToken');

const port = 5601;
const wsServer = createWsServer({});
const wsClient = createWsClient({ port });

beforeAll(async () => {
  wsServer.httpServer().listen(port);
  await wsClient.open();

  await db.dropDatabase();

  const kategorie1 = new Kategorie({
    typ: 'maraton',
    pohlavi: 'žena',
    vek: { min: 40, max: 49 }
  });
  await kategorie1.save();
  const kategorie2 = new Kategorie({
    typ: 'maraton',
    pohlavi: 'žena',
    vek: { min: 50, max: 59 }
  });
  await kategorie2.save();
  const kategorie3 = new Kategorie({
    typ: 'půlmaraton',
    pohlavi: 'žena',
    vek: { min: 40, max: 49 }
  });
  await kategorie3.save();
  const kategorie4 = new Kategorie({
    typ: 'půlmaraton',
    pohlavi: 'žena',
    vek: { min: 50, max: 59 }
  });
  await kategorie4.save();
  const kategorie5 = new Kategorie({
    typ: 'půlmaraton',
    pohlavi: 'muž',
    vek: { min: 50, max: 59 }
  });
  await kategorie5.save();
  const kategorie6 = new Kategorie({ typ: 'pěší' });
  await kategorie6.save();

  const rocnik1 = new Rocnik({ rok: 2015, datum: '2015-06-01' });
  rocnik1.kategorie.push({
    typ: 'maraton',
    kategorie: [kategorie1.id, kategorie2.id],
    startCisla: { rozsahy: ['1-100'] },
    startovne: { predem: 150, naMiste: 200 }
  });
  rocnik1.ubytovani.push({ den: 'pátek', poplatek: 50 });
  rocnik1.ubytovani.push({ den: 'sobota', poplatek: 60 });
  await rocnik1.save();

  const rocnik2 = new Rocnik({ rok: 2016, datum: '2016-06-01' });
  rocnik2.kategorie.push({
    typ: 'maraton',
    kategorie: [kategorie1.id, kategorie2.id],
    startCisla: { rozsahy: ['1-100'] },
    startovne: { predem: 150, naMiste: 200 }
  });
  rocnik2.ubytovani.push({ den: 'pátek', poplatek: 50 });
  rocnik2.ubytovani.push({ den: 'sobota', poplatek: 60 });
  await rocnik2.save();

  const rocnik3 = new Rocnik({ rok: 2017, datum: '2017-06-10' });
  rocnik3.kategorie.push({
    typ: 'maraton',
    kategorie: [kategorie1.id, kategorie2.id],
    startCisla: { rozsahy: ['1-100'] },
    startovne: { predem: 150, naMiste: 200 }
  });
  rocnik3.ubytovani.push({ den: 'pátek', poplatek: 50 });
  rocnik3.ubytovani.push({ den: 'sobota', poplatek: 60 });
  await rocnik3.save();

  const rocnik4 = new Rocnik({ rok: 2018, datum: '2018-06-08' });
  rocnik4.kategorie.push({
    typ: 'maraton',
    kategorie: [kategorie1.id, kategorie2.id],
    startCisla: { rozsahy: ['5-95'] },
    startovne: { predem: 200, naMiste: 250 }
  });
  rocnik4.kategorie.push({
    typ: 'půlmaraton',
    kategorie: [kategorie3.id, kategorie4.id, kategorie5.id],
    startCisla: { rozsahy: ['100-199'] },
    startovne: { predem: 200, naMiste: 250 }
  });
  rocnik4.kategorie.push({
    typ: 'pěší',
    kategorie: [kategorie6.id],
    startovne: { predem: 25, naMiste: 25 }
  });
  rocnik4.ubytovani.push({ den: 'pátek', poplatek: 60 });
  await rocnik4.save();
});

afterAll(async () => {
  await Kategorie.collection.drop();
  await Rocnik.collection.drop();

  await wsClient.close();
  wsServer.httpServer().close();

  await db.disconnect();
});

it('vytvoř minimálního účastníka', async () => {
  const udaje = {
    prijmeni: 'Balabák',
    jmeno: 'František',
    narozeni: { rok: 1953 },
    pohlavi: 'muž',
    obec: 'Ostrava 1'
  };
  const prihlaska = {
    datum: new Date('2018-02-07Z'),
    typKategorie: 'půlmaraton',
    kod: '===kod==='
  };

  const response1 = await wsClient.sendRequest(
    Actions.saveUdaje({ rok: 2018, udaje }, generateTestToken())
  );
  const { id } = response1.response;
  expect(id).toBeTruthy();

  const { requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2018, prihlaska }, generateTestToken())
  );
  expect(response).toMatchSnapshot();

  const ucastnici = await Ucastnik.find({}, { _id: 0 })
    .populate('ucasti.prihlaska.kategorie')
    .lean();
  ucastnici[0].ucasti[0].prihlaska.kategorie._id = '===k1===';
  expect(ucastnici).toMatchSnapshot();

  await Ucastnik.collection.drop();
});

it('vytvoř dvě účasti s přihláškami', async () => {
  const udaje1 = {
    prijmeni: 'Sukdoláková',
    jmeno: 'Božena',
    narozeni: { rok: 1967 },
    pohlavi: 'žena',
    obec: 'Kladno Rozdělov',
    psc: '327 41'
  };
  const udaje2 = { ...udaje1, obec: 'Kamenický Přívoz' };
  const prihlaska1 = {
    datum: new Date('2017-05-03Z'),
    typKategorie: 'maraton',
    kod: '===kod1==='
  };
  const prihlaska2 = {
    datum: new Date('2018-02-07Z'),
    typKategorie: 'půlmaraton',
    kod: '===kod2==='
  };

  let requestId;
  let response;
  ({ requestId, ...response } = await wsClient.sendRequest(
    Actions.saveUdaje({ rok: 2017, udaje: udaje1 }, generateTestToken())
  ));
  const { id } = response.response;
  expect(id).toBeTruthy();
  expect(requestId).not.toBeNull();
  response.response.id = '===id===';
  expect(response).toMatchSnapshot();

  ({ requestId, ...response } = await wsClient.sendRequest(
    Actions.saveUdaje({ id, rok: 2018, udaje: udaje2 }, generateTestToken())
  ));
  response.response.id = '===id===';
  expect(response).toMatchSnapshot();

  ({ requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2017, prihlaska: prihlaska1 }, generateTestToken())
  ));
  expect(response).toMatchSnapshot();
  ({ requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2018, prihlaska: prihlaska2 }, generateTestToken())
  ));
  expect(response).toMatchSnapshot();

  const ucastnici = await Ucastnik.find({}, { _id: 0 })
    .populate('ucasti.prihlaska.kategorie')
    .lean();
  ucastnici[0].ucasti[0].prihlaska.kategorie._id = '===k1===';
  ucastnici[0].ucasti[1].prihlaska.kategorie._id = '===k2===';
  expect(ucastnici).toMatchSnapshot();

  await Ucastnik.collection.drop();
});

it('přepiš existující přihlášku', async () => {
  const udaje = {
    prijmeni: 'Sukdoláková',
    jmeno: 'Božena',
    narozeni: { rok: 1967 },
    pohlavi: 'žena',
    obec: 'Kladno 1',
    psc: '327 41'
  };
  const prihlaska1 = { datum: new Date('2018-05-03Z'), typKategorie: 'maraton' };
  const prihlaska2 = { datum: new Date('2017-05-03Z'), typKategorie: 'maraton' };
  const prihlaska3 = { datum: new Date('2016-05-03Z'), typKategorie: 'maraton' };
  const prihlaska4 = { datum: new Date('2015-05-03Z'), typKategorie: 'maraton' };
  const prihlaska5 = { datum: new Date('2017-04-01Z'), typKategorie: 'maraton' };

  const response1 = await wsClient.sendRequest(
    Actions.saveUdaje({ rok: 2018, udaje }, generateTestToken())
  );
  const { id } = response1.response;
  expect(id).toBeTruthy();

  await wsClient.sendRequest(Actions.saveUdaje({ id, rok: 2017, udaje }, generateTestToken()));
  await wsClient.sendRequest(Actions.saveUdaje({ id, rok: 2016, udaje }, generateTestToken()));
  await wsClient.sendRequest(Actions.saveUdaje({ id, rok: 2015, udaje }, generateTestToken()));

  await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2018, prihlaska: prihlaska1 }, generateTestToken())
  );
  await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2017, prihlaska: prihlaska2 }, generateTestToken())
  );
  await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2016, prihlaska: prihlaska3 }, generateTestToken())
  );
  await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2015, prihlaska: prihlaska4 }, generateTestToken())
  );
  const { requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2017, prihlaska: prihlaska5 }, generateTestToken())
  );
  expect(response).toMatchSnapshot();

  const ucastnici = await Ucastnik.find({}, { _id: 0 })
    .populate('ucasti.prihlaska.kategorie')
    .lean();
  ucastnici[0].ucasti[0].prihlaska.kategorie._id = '===k1===';
  ucastnici[0].ucasti[1].prihlaska.kategorie._id = '===k2===';
  ucastnici[0].ucasti[2].prihlaska.kategorie._id = '===k3===';
  ucastnici[0].ucasti[3].prihlaska.kategorie._id = '===k4===';
  expect(ucastnici).toMatchSnapshot();

  await Ucastnik.collection.drop();
});

it('účastník neexistuje', async () => {
  const prihlaska = {
    datum: new Date('2018-02-07Z'),
    typKategorie: 'půlmaraton',
    kod: '===kod==='
  };

  const { requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska(
      { id: '41224d776a326fb40f000001', rok: 2018, prihlaska },
      generateTestToken()
    )
  );
  expect(response).toMatchSnapshot();
});

it('kategorie neexistuje', async () => {
  const udaje = {
    prijmeni: 'Balabák',
    jmeno: 'František',
    narozeni: { rok: 1953 },
    pohlavi: 'muž',
    obec: 'Ostrava 1'
  };
  const prihlaska = {
    datum: new Date('2018-02-07Z'),
    typKategorie: 'cyklo',
    startCislo: 34
  };

  const response1 = await wsClient.sendRequest(
    Actions.saveUdaje({ rok: 2018, udaje }, generateTestToken())
  );
  const { id } = response1.response;
  expect(id).toBeTruthy();

  const { requestId, ...response } = await wsClient.sendRequest(
    Actions.savePrihlaska({ id, rok: 2018, prihlaska }, generateTestToken())
  );
  expect(response).toMatchSnapshot();

  await Ucastnik.collection.drop();
});

it('savePrihlaska [not authenticated]', async () => {
  const { requestId, ...response } = await wsClient.sendRequest(Actions.savePrihlaska({}, null));
  expect(response).toMatchSnapshot();
});