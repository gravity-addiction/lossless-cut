import React, { memo, useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { primaryTextColor, primaryColor } from './colors';
import Select from './components/Select';
import { isDurationValid } from './segments';
import OSHDShim from './OSHDShim';
import { withBlur, mirrorTransform, checkAppPath } from './util';

const OSHD = memo(({
  filePath, duration, playerTime, workingRef, 
  updateSegAtIndex, cutSegments, setCurrentSegIndex, addSegment 
}) => {
  const sdobRef = useRef();

  const [OSHDCompName, setOSHDCompName] = useState('');
  const [OSHDCompEvent, setOSHDCompEvent] = useState('');
  const [OSHDRegKeys, setOSHDRegKeys] = useState({});
  
  const [SDOBEvents, setSDOBEvents] = useState([]);
  const [SDOBTeams, setSDOBTeams] = useState([]);
  const [SDOBRounds, setSDOBRounds] = useState([1,2,3,4,5,6]);
  const [SDOBSelectedEvent, setSDOBSelectedEvent] = useState('');
  const [SDOBSelectedTeam, setSDOBSelectedTeam] = useState('');
  const [SDOBSelectedRound, setSDOBSelectedRound] = useState(1);

  const [CompInfo, setCompInfo] = useState({});
  const [CompEvents, setCompEvents] = useState([]);
  const [CompTeams, setCompTeams] = useState([]);

  const oshdShim = useMemo(() => OSHDShim({ setOSHDRegKeys }), []);

  // oshdShim.getCompTeams(oshdShim.regKeys.CompName);

  useEffect(() => {
    const fetchTeams = async () => {
      // Fetch Teams
      // console.log('Fetching Info', OSHDRegKeys.CompName)
      const { compInfo, compEvents, compTeams } = await oshdShim.getCompTeams({ CompName: OSHDRegKeys.CompName });
      // console.log('compEvents', compEvents);
      // console.log('compTeams', compTeams);
      if (compInfo && Array.isArray(compInfo) && compInfo.length) {
        setCompInfo(compInfo[0]);
        setCompEvents(compEvents);
        setCompTeams(compTeams);
      
        // console.log('compInfo', compInfo);

        const eventList = compEvents.filter(e => e.Active).
          filter(e => e.IPCDiscipline === 'FS' || e.IPCDiscipline === 'Speed' || e.IPCDiscipline === 'CF' || e.IPCDiscipline === 'Artistic').
          map(e => e['CompEvents.EventName'])

        setSDOBEvents(eventList);
        if (!SDOBSelectedEvent && eventList.length) {
          setSDOBSelectedEvent(eventList[0]);
        }
      }
    };
    if (OSHDRegKeys && OSHDRegKeys.CompName) {
      fetchTeams();
    }
  }, [OSHDRegKeys]);

  useEffect(() => {
    const compEventInfo = CompEvents.find(e => e['CompEvents.EventName'] === SDOBSelectedEvent);
    setSDOBSelectedTeam('');
    setSDOBTeams(CompTeams.filter(c => c.CompEventID === compEventInfo.ID));
  }, [SDOBSelectedEvent]);

  useEffect(() => {
    console.log('Team', SDOBSelectedTeam);
  }, [SDOBSelectedTeam]);


  const getTeamKey = (val) => (`${val.CompEventID}T${val.TeamNumber}`);
  const findTeamKey = (key) => CompTeams.find(val => key === getTeamKey(val));

  const onSdobSetSlate = useCallback(async () => {
    if (workingRef.current || !filePath || !isDurationValid(duration)) {
      return;
    }

    // if (!sdobSelectedComp) {
    //   errorToast('Must Select a Competition');
    //   return;
    // }


    // const slateSegment = (myComp.segments || []).find((seg) => seg.name == 'slate');
    // console.log('Got Slate Seg', slateSegment);
    // if (!slateSegment) {
    //   errorToast('No Slate needed for this video');
    //   return;
    // }
    const slateSegment = { pre: 2, post: 3 };

    try {
      setCurrentSegIndex(0);
      updateSegAtIndex(0, {
        name: 'slate',
        start: Math.min(Math.max(playerTime - slateSegment.pre, 0), duration),
        end: Math.min(Math.max(playerTime + slateSegment.post, 0), duration)
      });
    } catch (err) {
      console.log(err.message);
    }
  }, [workingRef, filePath, duration, cutSegments, updateSegAtIndex, setCurrentSegIndex, playerTime, addSegment]);


  const onSdobSetExitPress = useCallback(async () => {
    if (workingRef.current || !filePath || !isDurationValid(duration)) {
      return;
    }

    // if (!sdobSelectedComp) {
    //   errorToast('Must Select a Competition');
    //   return;
    // }

    // const eventInfo = sdobGetEventBySlug(sdobSelectedEvent);
    // const compInfo = sdobGetCompById(sdobSelectedComp) || {}
    // const teamInfo = sdobGetTeamById(sdobSelectedTeam) || {};
    // const roundInfo = sdobGetRoundByI(sdobSelectedRound) || {};

    // const exitSegment = (compInfo.segments || []).find((seg) => seg.name == 'exit');
    // if (!exitSegment) {
    //   errorToast('No Exit needed for this video');
    //   return;
    // }

    const exitSegment = { pre: 5, post: 40 };
    try {
      setCurrentSegIndex(1);
      updateSegAtIndex(1, {
        name: 'working_time',
        start: Math.min(Math.max(playerTime - exitSegment.pre, 0), duration),
        end: Math.min(Math.max(playerTime + exitSegment.post, 0), duration)
      });
    } catch (err) {
      console.log(err.message);
    }
  }, [workingRef, filePath, duration, cutSegments, setCurrentSegIndex, updateSegAtIndex, playerTime, addSegment]);

  return (
    <div style={{ height: '3rem', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px' }}>
      <div
        style={{ height: '3rem', whiteSpace: 'nowrap', cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: '2rem', marginRight: 5, alignItems: 'center' }}
        onClick={onSdobSetSlate}
        title="Set Slate"
        role="button"
      >Slate</div>
      <div
        style={{ height: '3rem', whiteSpace: 'nowrap', cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: '2rem', marginRight: 5 }}
        onClick={onSdobSetExitPress}
        title="Set Exit"
        role="button"
      >Exit</div>

      <Select style={{ height: '3rem', maxWidth: '30vw', flexBasis: 85, flexGrow: 0 }} value={SDOBEvents.includes(SDOBSelectedEvent) ? SDOBSelectedEvent.toString() : ''} onChange={withBlur(e => setSDOBSelectedEvent(e.target.value))}>
        <option key="" value="" disabled>{SDOBSelectedEvent}</option>
        {SDOBEvents.map(val => (
          <option key={val} value={String(val)}>{val}</option>
        ))}
      </Select>

      <Select style={{ height: '3rem', flexBasis: 85, flexGrow: 0 }} value={SDOBRounds.includes(SDOBSelectedRound) ? SDOBSelectedRound : ''} onChange={withBlur(e => setSDOBSelectedRound(e.target.value))}>
        <option key="" value="" disabled>{SDOBSelectedRound}</option>
        {SDOBRounds.map(val => (
          <option key={val} value={String(val)}>{val}</option>
        ))}
      </Select>

      <Select style={{ height: '3rem', flexBasis: 85, flexGrow: 0 }} value={SDOBTeams.map(ct => getTeamKey(ct)).includes(getTeamKey(SDOBSelectedTeam)) ? getTeamKey(SDOBSelectedTeam) : ''} onChange={withBlur(e => setSDOBSelectedTeam(findTeamKey(e.target.value)))}>
        <option key="" value="" disabled>{SDOBSelectedTeam.TeamNumber} - {SDOBSelectedTeam.TeamName}</option>
        {SDOBTeams.map(val => (
          <option key={getTeamKey(val)} value={getTeamKey(val)}>{val.TeamNumber} - {val.TeamName}</option>
        ))}
      </Select>
    </div>
  );
});

export default SDOB;
