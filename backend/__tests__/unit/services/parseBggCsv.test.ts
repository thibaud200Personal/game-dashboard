import { describe, it, expect } from 'vitest';
import { parseBggCsv } from '../../../database/parseBggCsv';

const CSV_HEADER = 'id,name,yearpublished,rank,bayesaverage,average,usersrated,is_expansion,numowned';

describe('parseBggCsv', () => {
  it('parse une ligne standard', () => {
    const csv = `${CSV_HEADER}\n174430,Gloomhaven,2017,1,8.4,8.8,120000,0,50000`;
    const rows = parseBggCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ bgg_id: 174430, name: 'Gloomhaven', year_published: 2017, is_expansion: 0 });
  });

  it('parse un nom entre guillemets avec virgule', () => {
    const csv = `${CSV_HEADER}\n224517,"Brass: Birmingham",2018,2,8.5,8.9,100000,0,40000`;
    const rows = parseBggCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Brass: Birmingham');
    expect(rows[0].bgg_id).toBe(224517);
  });

  it('marque correctement une extension (is_expansion = 1)', () => {
    const csv = `${CSV_HEADER}\n169786,Scythe: Invaders from Afar,2016,10,8.0,8.2,30000,1,15000`;
    const rows = parseBggCsv(csv);
    expect(rows[0].is_expansion).toBe(1);
  });

  it('year_published null si vide', () => {
    const csv = `${CSV_HEADER}\n12345,OldGame,,999,6.0,6.5,1000,0,500`;
    const rows = parseBggCsv(csv);
    expect(rows[0].year_published).toBeNull();
  });

  it('ignore les lignes malformées', () => {
    const csv = `${CSV_HEADER}\nnot-a-number,BadGame,2020,1,7.0,7.5,1000,0,500\n174430,Gloomhaven,2017,1,8.4,8.8,120000,0,50000`;
    const rows = parseBggCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].bgg_id).toBe(174430);
  });

  it('ignore les lignes vides', () => {
    const csv = `${CSV_HEADER}\n174430,Gloomhaven,2017,1,8.4,8.8,120000,0,50000\n\n\n`;
    const rows = parseBggCsv(csv);
    expect(rows).toHaveLength(1);
  });

  it('parse plusieurs lignes', () => {
    const csv = [
      CSV_HEADER,
      '174430,Gloomhaven,2017,1,8.4,8.8,120000,0,50000',
      '266192,Wingspan,2019,5,8.0,8.2,80000,0,35000',
      '230802,Azul,2017,12,7.8,8.0,90000,0,45000',
    ].join('\n');
    const rows = parseBggCsv(csv);
    expect(rows).toHaveLength(3);
    expect(rows.map(r => r.bgg_id)).toEqual([174430, 266192, 230802]);
  });

  it('retourne un tableau vide si seulement le header', () => {
    const rows = parseBggCsv(CSV_HEADER);
    expect(rows).toHaveLength(0);
  });
});
