'use strict';

const fs = require('fs');
const util = require('util');
const xml2js = require('xml2js');
const common = require('../../common/common');
const db = require('../db');
const findAllRocniky = require('../api/Rocnik/findAllRocniky');
const Kategorie = require('./Kategorie/Kategorie');
const Rocnik = require('./Rocnik/Rocnik');
const Ucastnik = require('./Ucastnik/Ucastnik');

const convertNazevTypuKategorie = nazev => {
  switch (nazev) {
    case 'beh':
      return 'maraton';
    case 'kolobezka':
      return 'koloběžka';
    case 'pesi':
      return 'pěší';
    default:
      return nazev;
  }
};

const processPohlavi = pohlavi => {
  switch (pohlavi) {
    case 'muz':
      return 'muž';
    case 'zena':
      return 'žena';
    default:
      throw new Error(`Co to je za pohlaví? ${pohlavi}`);
  }
};

const vytvorUbytovaniRocniku = rocnik => {
  const ubytovani = {};

  if (rocnik.ubytovaniPaSo) {
    ubytovani.pátek = { poplatek: rocnik.ubytovaniPaSo[0] };
  }

  if (rocnik.ubytovaniSoNe) {
    ubytovani.sobota = { poplatek: rocnik.ubytovaniSoNe[0] };
  }

  return ubytovani;
};

const najdiCiUlozKategorii = async kategorie => {
  const { vek, ...query } = kategorie;
  if (vek && vek.min) {
    query['vek.min'] = vek.min;
  }
  if (vek && vek.max) {
    query['vek.max'] = vek.max;
  }
  if (vek && vek.presne) {
    query['vek.presne'] = vek.presne;
  }

  const nalezene = await Kategorie.find(query);
  if (nalezene.length > 0) {
    if (nalezene.length > 1) {
      throw new Error('Nalezl jsem více než jednu kategorii?');
    }
    return nalezene[0].id;
  }

  const ulozena = new Kategorie(kategorie);
  await ulozena.save();
  return ulozena.id;
};

const processKategorie = async (typ, xmlKategorie) => {
  const kategorie = { typ };

  if (xmlKategorie.pohlavi !== undefined) {
    kategorie.pohlavi = processPohlavi(xmlKategorie.pohlavi[0]);
  }

  if (
    xmlKategorie.minVek !== undefined ||
    xmlKategorie.maxVek !== undefined ||
    xmlKategorie.presnyVek
  ) {
    kategorie.vek = {};
  }
  if (xmlKategorie.minVek !== undefined) {
    const [min] = xmlKategorie.minVek;
    kategorie.vek.min = min;
  }
  if (xmlKategorie.maxVek !== undefined) {
    const [max] = xmlKategorie.maxVek;
    kategorie.vek.max = max;
  }
  if (xmlKategorie.presnyVek) {
    kategorie.vek.presne = true;
  }

  return najdiCiUlozKategorii(kategorie);
};

/* Process kategorieList sequentially so that Kategorie can be unique. */
const processKategorieList = async (typ, xmlKategorieList) => {
  if (xmlKategorieList && xmlKategorieList.length > 0) {
    const kategorie = [];
    // TODO: This should be eventually rewritten with async iteration: for await (const x of xy).
    // eslint-disable-next-line no-restricted-syntax
    for (const xmlKategorie of xmlKategorieList) {
      // eslint-disable-next-line no-await-in-loop
      kategorie.push(await processKategorie(typ, xmlKategorie));
    }

    return kategorie;
  }

  return [await najdiCiUlozKategorii({ typ })];
};

const processStartCisla = xmlStartCisla => {
  const content = typeof xmlStartCisla === 'string' ? xmlStartCisla : xmlStartCisla._;
  const rozsahy = content.split(' ');
  const startCisla = { rozsahy };
  if (xmlStartCisla.barva) {
    startCisla.barva = xmlStartCisla.barva;
  }
  return startCisla;
};

const processTypKategorie = async xmlTyp => {
  const nazev = convertNazevTypuKategorie(xmlTyp.typ[0]);
  const kategorie = await processKategorieList(nazev, xmlTyp.kategorie);

  const [predem] = xmlTyp.startovne[0].predem;
  const [naMiste] = xmlTyp.startovne[0].naMiste;
  const startovne = { predem, naMiste };
  if (xmlTyp.startovne[0].zaloha) {
    const [zaloha] = xmlTyp.startovne[0].zaloha;
    startovne.zaloha = zaloha;
  }

  const typ = { typ: nazev, kategorie, maStartCisla: false, startovne };

  if (xmlTyp.startCisla) {
    typ.maStartCisla = true;
    typ.startCisla = processStartCisla(xmlTyp.startCisla[0]);
  }

  return typ;
};

const processRocnik = async xmlRocnik => {
  const [rok] = xmlRocnik.rok;
  const [datum] = xmlRocnik.datum;
  const ubytovani = vytvorUbytovaniRocniku(xmlRocnik);
  const kategorie = await Promise.all(
    xmlRocnik.typKategorie.map(async xmlTyp => processTypKategorie(xmlTyp))
  );

  const rocnik = new Rocnik({ rok, datum, ubytovani, kategorie });
  await rocnik.save();
  return rocnik.id;
};

/* Process rocniky sequentially so that Kategorie can be unique. */
const processRocniky = async rocniky => {
  // TODO: This should be eventually rewritten with async iteration: for await (const x of xy).
  // eslint-disable-next-line no-restricted-syntax
  for (const rocnik of rocniky) {
    // eslint-disable-next-line no-await-in-loop
    await processRocnik(rocnik);
  }
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const processNarozeni = narozeni => {
  if (narozeni.length === 4) {
    return { rok: narozeni };
  }

  const matcher = /(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const result = matcher.exec(narozeni);

  return { rok: result[1], mesic: result[2], den: result[3] };
};

const processUdaje = xmlUdaje => {
  const udaje = {
    prijmeni: xmlUdaje.prijmeni[0],
    jmeno: xmlUdaje.jmeno[0],
    narozeni: processNarozeni(xmlUdaje.narozen[0]),
    pohlavi: processPohlavi(xmlUdaje.pohlavi[0]),
    obec: xmlUdaje.mesto[0],
    stat: xmlUdaje.stat[0]
  };

  if (xmlUdaje.adresa) {
    const [adresa] = xmlUdaje.adresa;
    udaje.adresa = adresa;
  }
  if (xmlUdaje.PSC) {
    const [psc] = xmlUdaje.PSC;
    udaje.psc = psc;
  }
  if (xmlUdaje.klub) {
    const [klub] = xmlUdaje.klub;
    udaje.klub = klub;
  }
  if (xmlUdaje.email && xmlUdaje.email[0]) {
    const [email] = xmlUdaje.email;
    udaje.email = email;
  }
  if (xmlUdaje.telefon && xmlUdaje.telefon[0]) {
    const [telefon] = xmlUdaje.telefon;
    udaje.telefon = telefon;
  }

  return udaje;
};

const processPrihlaska = (rocniky, xmlPrihlaska, xmlUcast, rok, pohlavi, narozeni) => {
  const typ = (xmlPrihlaska && xmlPrihlaska.kategorie[0]) || xmlUcast.vykon[0].kategorie[0];
  const { kategorie, code, status } = common.findKategorie(rocniky, {
    rok,
    typ: convertNazevTypuKategorie(typ),
    pohlavi,
    narozeni,
    mladistvyPotvrzen: true
  });
  if (code !== common.CODE_OK) {
    throw new Error(`${code} - ${status}`);
  }

  // ISO 8601 date-only strings are treated as UTC, not local.
  const datum = (xmlPrihlaska && new Date(xmlPrihlaska.datum[0])) || rocniky[rok].datum;
  return {
    datum,
    kategorie: kategorie.id
  };
};

const processVykon = (rocniky, xmlUcast, xmlVykon, rok, pohlavi, narozeni) => {
  const typ = convertNazevTypuKategorie(xmlVykon.kategorie[0]);
  const { kategorie, code, status } = common.findKategorie(rocniky, {
    rok,
    typ,
    pohlavi,
    narozeni,
    mladistvyPotvrzen: true
  });
  if (code !== common.CODE_OK) {
    throw new Error(`${code} - ${status}`);
  }

  const vykon = {
    kategorie: kategorie.id,
    dokonceno: xmlVykon.dokonceno && xmlVykon.dokonceno[0]
  };

  if (xmlUcast.startCislo) {
    const [startCislo] = xmlUcast.startCislo;
    vykon.startCislo = startCislo;
  }

  if (xmlVykon.cas) {
    const [cas] = xmlVykon.cas;
    vykon.cas = cas;
  }

  return vykon;
};

const vytvorPlatbu = (ucast, datum, typ = 'hotově') => {
  const platba = {
    castka: ucast.zaplaceno[0],
    datum,
    typ
  };
  if (ucast.sponzor) {
    const [sponzor] = ucast.sponzor;
    platba.poznamka = sponzor;
  }
  return platba;
};

const vytvorUbytovaniUcastnika = (prihlaska, ucast) => {
  const ubytovani = {};

  if (prihlaska && prihlaska.ubytovaniPaSo !== undefined) {
    ubytovani.pátek = { prihlaseno: true };
  }
  if (ucast && ucast.ubytovaniPaSo !== undefined) {
    ubytovani.pátek = { ...ubytovani.pátek, prespano: true };
  }

  if (prihlaska && prihlaska.ubytovaniSoNe) {
    ubytovani.sobota = { prihlaseno: true };
  }
  if (ucast && ucast.ubytovaniSoNe) {
    ubytovani.sobota = { ...ubytovani.sobota, prespano: true };
  }

  return ubytovani;
};

const processZajem = async (rocniky, zajem, udaje) => {
  const rok = zajem.rok[0];
  const ucast = { rok, udaje };

  if (zajem.prihlaska || zajem.ucast) {
    ucast.prihlaska = processPrihlaska(
      rocniky,
      zajem.prihlaska && zajem.prihlaska[0],
      zajem.ucast && zajem.ucast[0],
      rok,
      udaje.pohlavi,
      udaje.narozeni
    );
  }

  if (zajem.ucast) {
    ucast.vykon = processVykon(
      rocniky,
      zajem.ucast[0],
      zajem.ucast[0].vykon[0],
      rok,
      udaje.pohlavi,
      udaje.narozeni
    );
  }

  ucast.ubytovani = vytvorUbytovaniUcastnika(
    zajem.prihlaska && zajem.prihlaska[0],
    zajem.ucast && zajem.ucast[0]
  );

  if (zajem.ucast && zajem.ucast[0]) {
    ucast.platby = [vytvorPlatbu(zajem.ucast[0], rocniky[rok].datum)];
  }

  if (zajem.poznamka) {
    const [poznamka] = zajem.poznamka;
    ucast.poznamky = [{ datum: rocniky[rok].datum, text: poznamka }];
  }

  return ucast;
};

const processZajmy = async (rocniky, zajmy, udaje) =>
  Promise.all(zajmy.map(async zajem => processZajem(rocniky, zajem, udaje)));

const processUcastnik = async (rocniky, ucastnik) => {
  const udaje = processUdaje(ucastnik.udaje[0]);
  if (ucastnik.zajem) {
    const ucastnikDB = new Ucastnik();
    ucastnikDB.ucasti = await processZajmy(rocniky, ucastnik.zajem, udaje);
    await ucastnikDB.save();
  }
};

const processUcastniky = async (rocniky, ucastnici) =>
  Promise.all(ucastnici.map(async ucastnik => processUcastnik(rocniky, ucastnik)));

const importFromXML = async ({ file, data }) => {
  await db.dropDatabase();

  const parser = new xml2js.Parser({ mergeAttrs: true });

  if (file) {
    // eslint-disable-next-line no-param-reassign
    data = await util.promisify(fs.readFile)(file, 'utf8');
  }

  const result = await util.promisify(parser.parseString)(data);
  await processRocniky(result.jcm.rocnik);

  if (result.jcm.ucastnici) {
    const { code, status, response } = await findAllRocniky();
    if (code !== common.CODE_OK) {
      throw new Error(`${code} - ${status}`);
    }
    await processUcastniky(response.rocniky, result.jcm.ucastnici[0].ucastnik);
  }
};

module.exports = importFromXML;
