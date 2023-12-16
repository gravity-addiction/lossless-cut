import React, { useEffect, useMemo } from 'react';

const ADODB = require('node-adodb');
const Registry = require('winreg')
const OSHDRegKey = '\\Software\\OSHD';
// const mdbFile = 'C:\\OSHD_Data\\Database\\2023-Collegiate.mdb';
// const mdbFile = '\\\\WEASELBEAR\\OSHD_Data\\Database\\2023-Collegiate.mdb';

export default () => {
  const regKey = new Registry({ hive: Registry.HKCU, key: OSHDRegKey });
  let regKeys;
  let connection;

  // const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${mdbFile};`);
  regKey.values((err, items) => {
    if (err)
      console.log('ERROR: '+err);
    else
      regKeys = items.reduce((t, c) => {
        t[c.name] = c.value
        return t;
      }, {});

      if (regKeys.hasOwnProperty('Database') && regKeys.Database) {
        connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${regKeys.Database};`);
        connection.query(`SELECT * FROM Teams`).then(console.log).catch(console.error);
      }
  });

  function getComps(compName) {
    if (!connection) {
      console.log('No DB Connection Yet')
      return 1
    }
    // Query
    return connection.query(`SELECT *
      FROM EventDefinitions INNER JOIN CompEvents ON EventDefinitions.EventName = CompEvents.EventName
      WHERE CompEvents.CompName="${compName}"; = `);
  }

  function getEventList() {
    
  }

  function getTeams(compEventId) {
    if (!connection) {
      console.log('No DB Connection Yet')
      return 1
    }
    // Query
    return connection.query(`SELECT * FROM Teams WHERE CompEventID = ${compEventId}`);
  }




  
  // function sdobGetEventList() {
  //   if (!sdobAPIServer) { return; }

  //   const baseUrl = new URL(sdobAPIServer );
  //   const apiUrl = new URL(pathJoin(baseUrl.pathname, '/events'), sdobAPIServer).href
  //   fetch(apiUrl)
  //     .then(res => res.json())
  //     .then((eventListResp) => {
  //       console.log('Event List Return', eventListResp);
  //       setSdobEventList(eventListResp || []);
  //       if (!sdobSelectedEvent) {
  //         setSdobSelectedEvent((eventListResp || []).length ? eventListResp[0].slug || '' : '');
  //       }
  //     });
  // }

  // function sdobGetEventBySlug(event_slug) {
  //   return (sdobEventList || []).find((event) => String(event.slug) === String(event_slug));
  // };
  // function sdobGetCompById(comp_id) {
  //   return (sdobCompList || []).find((comp) => String(comp.id) === String(comp_id));
  // };
  // function sdobGetTeamById(team_id) {
  //   return (sdobTeamList || []).find((team) => String(team.id) === String(team_id));
  // };
  // function sdobGetRoundByI(round_i) {
  //   return (sdobRoundList || []).find((rnd) => String(rnd.i) === String(round_i));
  // };

  return {
    getComps,
    getEventList,
    getTeams
  };
};


