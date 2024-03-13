import React, { useEffect, useMemo } from 'react';

const ADODB = require("node-adodb");
if (!isAppDebug()) {
// if (main.filename.indexOf('app.asar') !== -1) {
  ADODB.PATH = './resources/adodb.js';
}
const Registry = require('winreg')
const OSHDRegKey = '\\Software\\OSHD';
// const mdbFile = 'C:\\OSHD_Data\\Database\\2023-Collegiate.mdb';
// const mdbFile = '\\\\WEASELBEAR\\OSHD_Data\\Database\\2023-Collegiate.mdb';

export default ({ setOSHDRegKeys }) => {

  const regKey = new Registry({ hive: Registry.HKCU, key: OSHDRegKey });
  let regKeys;
  let connection;

  regKey.values((err, items) => {
    if (err) {
      console.error(err);
    } else {
      regKeys = items.reduce((t, c) => {
        t[c.name] = c.value
        return t;
      }, {});

      if (regKeys.hasOwnProperty('Database') && regKeys.Database) {
        connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${regKeys.Database};`);
        if (!connection) {
          console.error('DB Connection Unavailable');
        }
        setOSHDRegKeys(regKeys);
      }
    }
  });

  const getCompTeams = async ({ CompName }) => {
    const compInfo = await getComp({ CompName }).catch(console.error);
    const compEvents = await getEvents({ CompName }).catch(console.error);
    const compTeams = await getTeams({ CompName }).catch(console.error);
    return { compInfo, compEvents, compTeams };
  }

  const getRegKeys = () => {
    return regKeys;
  }

  const getComp = ({ CompName }) => {
    if (!connection) {
      console.log('No DB Connection Yet')
      return Promise.reject('No DB Connection');
    }
    if (!CompName) {
      return Promise.reject('No CompName');
    }
  console.log('Trying');
    return connection.query(`SELECT * FROM Competitions WHERE CompName = '${String(CompName).replaceAll("'", "''")}'`);
  }

  const getEvents = ({ CompName }) => {
    if (!connection) {
      console.log('No DB Connection Yet')
      return Promise.reject('No DB Connection');
    }
    if (!CompName) {
      return Promise.reject('No CompName');
    }

    return connection.query(`SELECT * FROM EventDefinitions INNER JOIN CompEvents ON EventDefinitions.EventName = CompEvents.EventName WHERE CompEvents.CompName='${String(CompName).replaceAll("'", "''")}';`);
  }

  const getTeams = ({ CompName }) => {
    if (!connection) {
      console.log('No DB Connection Yet')
      return Promise.reject('No DB Connection');
    }
    if (!CompName) {
      return Promise.reject('No CompName');
    }

    return connection.query(`SELECT * FROM Teams WHERE CompEventID = ANY(SELECT ID FROM EventDefinitions INNER JOIN CompEvents ON EventDefinitions.EventName = CompEvents.EventName WHERE CompEvents.CompName='${String(CompName).replaceAll("'", "''")}')`);
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
    getCompTeams,
    getRegKeys
  };
};


