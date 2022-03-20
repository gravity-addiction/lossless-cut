import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Select, CrossIcon } from 'evergreen-ui';
import i18n from 'i18next';
import { useTranslation, Trans } from 'react-i18next';
import { IoIosHelpCircle } from 'react-icons/io';

import SelectTeamButton from './components/SelectTeamButton';
import HighlightedText from './components/HighlightedText';
import { primaryColor } from './colors';
import { withBlur, toast } from './util';

const sheetStyle = {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  zIndex: 10,
  background: 'rgba(105, 105, 105, 0.7)',
  backdropFilter: 'blur(10px)',
  overflowY: 'scroll',
  display: 'flex',
};

const boxStyle = { margin: '15px 15px 50px 15px', background: 'rgba(25, 25, 25, 0.6)', borderRadius: 10, padding: '10px 20px', minHeight: '80vh', minWidth: '90vw', position: 'relative' };
const HelpIcon = ({ onClick }) => <IoIosHelpCircle size={20} role="button" onClick={withBlur(onClick)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 5 }} />;

const SdobTeamConfirm = memo(({
  visible, onClosePress, sdobChangedCompClick,
  
  onSdobSetSlatePress, onSdobSetExitPress,
  
  setSdobSelectedComp, setSdobSelectedTeam, setSdobSelectedRound,
  sdobSelectedComp, sdobSelectedTeam, sdobSelectedRound,
  sdobCompList, sdobTeamList, sdobRoundList,
  setSdobCompList, setSdobTeamList, setSdobRoundList,
  
  setSdobTeamConfirmVisible, sdobTeamConfirmVisible,
  onSdobTeamConfirm, sdobCloseTeamConfirm,
}) => {
  const { t } = useTranslation();


  const sdobChangedRound = (cList, roundNum) => {
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Team
    const roundInd = cList.findIndex((round) => String(round.roundNum) === String(roundNum));
    if (roundInd > -1) {
      setSdobSelectedRound(cList[roundInd].id || 0);
    }    
  };

  const sdobChangedTeam = (cList, id) => {
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Team
    const teamInd = cList.findIndex((team) => String(team.id) === String(id));
    if (teamInd > -1) {
      setSdobSelectedTeam(cList[teamInd].id || 0);
      // setSdobTeamList((compList[compInd].teams || []).sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber)) ? 1 : -1));
    }
  };

  const sdobChangedComp = (cList, id) => {
    console.log('Setting Comp', cList, id);
    if (!Array.isArray(cList)) {
      return;
    }
    // Find Comp
    const compInd = cList.findIndex((comp) => String(comp.id) === String(id));
    if (compInd > -1) {
      setSdobSelectedComp(cList[compInd].id || 0);

      // Setup rounds
      const roundArray = [];
      for (let r = 0; r < (cList[compInd].roundCnt || 0); r++) {
        roundArray.push({ i: r, roundNum: String(r + 1) });
      }
      for (let r = 0; r < (cList[compInd].exRoundCnt || 0); r++) {
        roundArray.push({ i: r, roundNum: `${cList[compInd].exRoundPre}${String(r + 1)}` });
      }
      console.log('Round Array', roundArray);
      setSdobRoundList(roundArray);
      setSdobSelectedRound(roundArray.length ? roundArray[0].id || 0 : 0);

      // Setup Teams
      if (!Array.isArray(cList[compInd].teams)) {
        return;
      }
      let teams = (cList[compInd].teams || [])
      teams = teams.sort((a, b) => (Number(a.teamNumber) > Number(b.teamNumber) ? 1 : -1));
      console.log('Team Array', teams);
      setSdobTeamList(teams);
      if (teams && teams.length) {
        sdobChangedTeam(teams, teams[0].id);
      }

    }
  };


  const onSdobRoundClicked = useCallback(async (team, rnd) => {
    setSdobSelectedTeam(team.id);
    setSdobSelectedRound(rnd.i);
    setSdobTeamConfirmVisible(false);
  });

  useEffect(() => {
    console.log('Fetching Info');
    fetch('https://api.thegarybox.com/api/latest/events/2022_perris_fresh_meet/comps')
      .then(res => res.json())
      .then((compListResp) => {
        if (Array.isArray(compListResp.comps)) {
          // Map Comp Disiplines to segmentNeeded
          compListResp.comps = (compListResp.comps || []).map((comp) => {
            comp.segments = [{ name: 'slate', pre: 2, post: 3 }]
            // CF Rotations
            if (comp.discipline.toLocaleUpperCase() == 'CF4R') {
              comp.segments.push({ name: 'exit', pre: 5, post: 100 });
            // CF Sequentials 4-Way
            } else if (comp.discipline.toLocaleUpperCase() == 'CF4S') {
              comp.segments.push({ name: 'exit', pre: 5, post: 130 });
            // CF Sequentials 2-Way
            } else if (comp.discipline.toLocaleUpperCase() == 'CF2') {
              comp.segments.push({ name: 'exit', pre: 5, post: 70 });
            // FS Collegiates
            } else if (comp.discipline.toLocaleUpperCase() == 'FSCOLLEGIATE') {
              comp.segments.push({ name: 'exit', pre: 5, post: 50 })

            } else if (comp.discipline.toLocaleUpperCase() == 'FSSPEED') {
              comp.segments.push({ name: 'exit', pre: 5, post: 50 })

            } else if (comp.discipline.toLocaleUpperCase() == 'FS') {
              comp.segments.push({ name: 'exit', pre: 5, post: 40 })
            }
            return comp;
          })
          setSdobCompList(compListResp.comps || []);
          if (!sdobSelectedComp) {
            setSdobSelectedComp((compListResp.comps || []).length ? compListResp.comps[0].id || 0 : 0);
          }
          sdobChangedComp(compListResp.comps || [], ((compListResp.comps || [])[0] || {}).id);
        }
      });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={sheetStyle}
            transition={{ duration: 0.3, easings: ['easeOut'] }}
          >
            <div style={{ margin: 'auto' }}>
              <div style={boxStyle}>
                <CrossIcon size={24} style={{ position: 'absolute', right: 0, top: 0, padding: 15, boxSizing: 'content-box', cursor: 'pointer' }} role="button" onClick={onClosePress} />

                <div class="sdob-team-selection-container">
                  <div>
                    <Select width="100%" height={50} onChange={sdobChangedCompClick}>
                      <option key="" value="" disabled>Select Comp</option>
                      {sdobCompList.map(val => (
                        <option key={val.id} value={String(val.id)}>{String(val.name)} {String(val.class)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <h2 class="sdob-team-selection-item" style={{ marginTop: 0, width: '60vw' }}>Round Number</h2>
                  </div>
                </div>

                <div>
                {sdobTeamList.map(team => (
                  <div key={team.id.toString()} class="sdob-team-selection-container">
                    <div class="sdob-team-selection-item sdob-team-selection-name">{String(team.teamNumber)} {String(team.name)}</div>
                    {sdobRoundList.map(rnd => (
                      <div
                        key={rnd.i.toString()}
                        style={{ cursor: 'pointer', background: primaryColor, borderRadius: 2 * 5, paddingTop: 2 * 1, paddingBottom: 2 * 2.5, paddingLeft: 2 * 7, paddingRight: 2 * 7, fontSize: 2 * 13 }}
                        class="sdob-team-selection-item"
                        onClick={() => onSdobRoundClicked(team, rnd)} 
                      >{String(rnd.roundNum)}</div>
                    ))}
                  </div>
                ))}               
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default SdobTeamConfirm;
