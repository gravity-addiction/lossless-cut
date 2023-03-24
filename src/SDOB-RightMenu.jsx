import { Select } from 'evergreen-ui';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { IoIosCamera } from 'react-icons/io';
import { FaTrashAlt } from 'react-icons/fa';
import { MdRotate90DegreesCcw } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

import { primaryTextColor } from './colors';

// import ExportButton from './components/ExportButton';
import SdobExportButton from './components/SdobExportButton';
import SdobSetExitButton from './components/SdobSetExitButton';
import SdobSetSlateButton from './components/SdobSetSlateButton';
import ToggleExportConfirm from './components/ToggleExportConfirm';
import SdobTeamConfirm from './SDOB-TeamConfirm';
import { primaryColor } from './colors';

const RightMenu = memo(({
  isRotationSet, rotation, increaseRotation, cleanupFiles, renderCaptureFormatButton,
  capture, onExportPress, enabledOutSegments, hasVideo, exportConfirmEnabled, toggleExportConfirmEnabled,
  simpleMode, onSdobSetExitPress, onSdobSetSlatePress, onExportConfirm, 
  setSelectedComp, setSelectedTeam, setSelectedRound, selectedComp, selectedTeam, selectedRound,
  setExportConfirmVisible, setSdobTeamConfirmVisible, sdobTeamConfirmVisible, onSdobTeamConfirm, closeSdobTeamConfirm,
  sdobCompList, sdobTeamList, sdobRoundList
}) => {
  const rotationStr = `${rotation}°`;

  const { t } = useTranslation();

  const [compList, setCompList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [roundList, setRoundList] = useState([]);

  const changedRound = (cList, roundNum) => {
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Team
    const roundInd = cList.findIndex((round) => String(round.roundNum) === String(roundNum));
    if (roundInd > -1) {
      console.log('SETTING ROUND', cList[roundInd]);
      setSelectedRound(cList[roundInd]);
    }    
  };

  const changedTeam = (cList, id) => {
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Team
    const teamInd = cList.findIndex((team) => String(team.id) === String(id));
    if (teamInd > -1) {
      console.log('SETTING TEAM', cList[teamInd]);
      setSelectedTeam(cList[teamInd]);
      // setTeamList((compList[compInd].teams || []).sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber)) ? 1 : -1));
    }
  };

  const changedComp = (cList, id) => {
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Comp
    const compInd = cList.findIndex((comp) => String(comp.id) === String(id));
    if (compInd > -1) {
      setSelectedComp(cList[compInd]);

      // Setup rounds
      const roundArray = [];
      for (let r = 0; r < (cList[compInd].roundCnt || 0); r++) {
        roundArray.push({ i: r, roundNum: String(r + 1) });
      }
      for (let r = 0; r < (cList[compInd].exRoundCnt || 0); r++) {
        roundArray.push({ i: r, roundNum: `${cList[compInd].exRoundPre}${String(r + 1)}` });
      }
      setRoundList(roundArray);
      setSelectedRound(roundArray[0] || null);

      // Setup Teams
      if (!Array.isArray(cList[compInd].teams)) {
        return;
      }
      let teams = cList[compInd].teams || [];
      teams = teams.sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber) ? 1 : -1));
      setTeamList(teams);
      if (teams && teams.length) {
        changedTeam(teams, teams[0].id);
      }

    }
  };


  const sdobChangedCompClick = (event) => {
    changedComp(compList, event.target.value);
  };

  const sdobChangedTeamClick = (event) => {
    changedTeam(teamList, event.target.value);
  };

  const sdobChangedRoundClick = (event) => {
    changedRound(roundList, event.target.value);
  };  

  const sdobSelectTeamOpenClick = (event) => {
    setExportConfirmVisible(true)
  };
  
  useEffect(() => {
    console.log('Fetching Info');
    fetch('https://api.thegarybox.com/api/latest/events/2023_perris_fresh_meet/comps')
      .then(res => res.json())
      .then((compListResp) => {
        if (Array.isArray(compListResp.comps)) {
          console.log('Comp List', compListResp.comps);
          setCompList(compListResp.comps || []);
          changedComp(compListResp.comps || [], ((compListResp.comps || [])[0] || {}).id);
        }
      });
  }, []);
  
  return (
    <div className="no-user-select" style={{ padding: '.3em', flex: 10, display: 'flex', alignItems: 'center' }}>

      {!simpleMode && hasVideo && (
        <>
          <span style={{ textAlign: 'right', display: 'inline-block' }}>{isRotationSet && rotationStr}</span>
          <MdRotate90DegreesCcw
            size={26}
            style={{ margin: '0px 5px 0 2px', verticalAlign: 'middle', color: isRotationSet ? primaryTextColor : undefined }}
            title={`${t('Set output rotation. Current: ')} ${isRotationSet ? rotationStr : t('Don\'t modify')}`}
            onClick={increaseRotation}
            role="button"
          />
        </>
      )}

      {!simpleMode && (
        <FaTrashAlt
          title={t('Close file and clean up')}
          style={{ padding: '5px 10px' }}
          size={16}
          onClick={cleanupFiles}
          role="button"
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
        { selectedComp?.name } { selectedTeam?.name } { selectedRound?.roundNum }
      </div>
      
      <div
        style={{ cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: 13 }}
        onClick={setSdobTeamConfirmVisible}
        title='Show Team Selection'
        role="button"
      >
        Select Team
      </div>
      
      <SdobTeamConfirm visible={sdobTeamConfirmVisible} 
        onClosePress={closeSdobTeamConfirm} onSdobTeamConfirm={onSdobTeamConfirm} 
        sdobCompList={sdobCompList} sdobTeamList={sdobTeamList} sdobRoundList={sdobRoundList}
        sdobChangedCompClick={sdobChangedCompClick}
      />

      {hasVideo && (
        <>
          {!simpleMode && renderCaptureFormatButton({ height: 20 })}

          <SdobSetSlateButton
            enabledOutSegments={enabledOutSegments}
            onClick={onSdobSetSlatePress}
          />

          <SdobSetExitButton
            enabledOutSegments={enabledOutSegments}
            onClick={onSdobSetExitPress}
          />

          <SdobExportButton
            enabledOutSegments={enabledOutSegments}
            onClick={onExportConfirm}
          />
          

          <IoIosCamera
            size={25}
            title={t('Capture frame')}
            onClick={capture}
          />
        </>
      )}

      {!simpleMode && <ToggleExportConfirm style={{ marginRight: 5 }} exportConfirmEnabled={exportConfirmEnabled} toggleExportConfirmEnabled={toggleExportConfirmEnabled} />}
    </div>
  );
});

export default RightMenu;
