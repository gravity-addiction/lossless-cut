
// const ADODB = require('node-adodb');

const mdbFile = '/Users/gary/Development/sdob-scoring-project/2023-Collegiate.mdb';

export default () => {

  // const connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${mdbFile};`);

  function getEventList() {
    
  }
  function getTeams() {
    // Query
    // return connection
    // .query('SELECT * FROM Teams')
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
    getEventList,
    getTeams
  };
};


