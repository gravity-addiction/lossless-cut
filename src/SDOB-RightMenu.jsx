import { Select } from 'evergreen-ui';
import React, { memo, useEffect, useState } from 'react';
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


const RightMenu = memo(({
  isRotationSet, rotation, increaseRotation, cleanupFiles, renderCaptureFormatButton,
  capture, onExportPress, enabledOutSegments, hasVideo, exportConfirmEnabled, toggleExportConfirmEnabled,
  simpleMode, onSdobSetExitPress, onSdobSetSlatePress,
}) => {
  const rotationStr = `${rotation}°`;

  const { t } = useTranslation();

  const [compList, setCompList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [roundList, setRoundList] = useState([]);


  const changedTeam = (id) => {
    if (!Array.isArray(teamList)) {
      return;
    }
    // Find Team
    const teamInd = teamList.findIndex((team) => String(team.id) === String(id));
    if (teamInd > -1) {
      // setTeamList((compList[compInd].teams || []).sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber)) ? 1 : -1));
      setRoundList([{ i: 0, roundNum: '1' }, { i: 1, roundNum: '2' }, { i: 2, roundNum: '3' }]);
    }
  };

  const changedComp = (id) => {
    if (!Array.isArray(compList)) {
      return;
    }
    // Find Comp
    const compInd = compList.findIndex((comp) => String(comp.id) === String(id));
    if (compInd > -1) {
      if (!Array.isArray(compList[compInd].teams)) {
        return;
      }
      console.log('Set Teams');
      let teams = compList[compInd].teams || [];
      teams = teams.sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber)) ? 1 : -1);
      setTeamList(teams);
      if (teams && teams.length) {
        changedTeam(teams[0].id);
      }
    }
  };


  const changedCompClick = (event) => {
    changedComp(event.target.value);
  };

  const changedTeamClick = (event) => {
    changedTeam(event.target.value);
  };

  useEffect(() => {
    fetch('https://dev.skydiveorbust.com/api/latest/events/2020_cf_ghost_nationals/comps')
      .then(res => res.json())
      .then((compListResp) => {
        if (Array.isArray(compListResp.comps)) {
          console.log('Comp List', compListResp.comps);
          setCompList(compListResp.comps || []);
          changedComp(((compListResp.comps || [])[0] || {}).id);
        }
      });
  });

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
        <Select width="100%" height={50} style={{ minWidth: 120, flex: 3, right: '10px', fontSize: 18 }} onChange={changedCompClick}>
          <option key="" value="" disabled>Select Comp</option>
          {compList.map(val => (
            <option key={val.id} value={String(val.id)}>{String(val.name)} {String(val.class)}</option>
          ))}
        </Select>

        <Select width="100%" height={50} size={500} style={{ minWidth: 120, flex: 3, right: '10px', fontSize: 18 }} onChange={changedTeamClick}>
          <option key="" value="" disabled>Select Team</option>
          {teamList.map(val => (
            <option key={val.id} value={String(val.id)}>{String(val.teamNumber)} {String(val.name)}</option>
          ))}
        </Select>


        <Select width="100%" height={50} size={500} style={{ minWidth: 40, flex: 1, right: '10px', fontSize: 18 }}>
          <option key="" value="" disabled>Select Round</option>
          {roundList.map(val => (
            <option key={val.i} value={String(val.roundNum)}>{String(val.roundNum)}</option>
          ))}
        </Select>
      </div>

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
            onClick={onExportPress}
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
