import React, { memo, useCallback, useState } from 'react';
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
  visible, onClosePress, onSdobTeamConfirm, compList, teamList, roundList, changedCompClick,
}) => {
  const { t } = useTranslation();

  console.log('Team List', teamList);
  const onRoundClicked = useCallback(async (team, rnd) => {
    console.log('Team:', team, 'Round Clicked', rnd);
  });

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
                    <Select width="100%" height={50} onChange={changedCompClick}>
                      <option key="" value="" disabled>Select Comp</option>
                      {compList.map(val => (
                        <option key={val.id} value={String(val.id)}>{String(val.name)} {String(val.class)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <h2 class="sdob-team-selection-item" style={{ marginTop: 0, width: '60vw' }}>Round Number</h2>
                  </div>
                </div>

                <div>
                {teamList.map(team => (
                  <div class="sdob-team-selection-container">
                    <div class="sdob-team-selection-item sdob-team-selection-name">{String(team.teamNumber)} {String(team.name)}</div>
                    {roundList.map(rnd => (
                      <div 
                        style={{ cursor: 'pointer', background: primaryColor, borderRadius: 2 * 5, paddingTop: 2 * 1, paddingBottom: 2 * 2.5, paddingLeft: 2 * 7, paddingRight: 2 * 7, fontSize: 2 * 13 }}
                        class="sdob-team-selection-item"
                        onClick={() => onRoundClicked(team, rnd)} 
                      >{String(rnd.roundNum)}</div>
                    ))}
                  </div>
                ))}               
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ zIndex: 11, position: 'fixed', right: 0, bottom: 0, display: 'flex', alignItems: 'center', margin: 5 }}>
            <motion.div
              style={{ transformOrigin: 'bottom right' }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4, easings: ['easeOut'] }}
            >
              <SelectTeamButton onClick={() => onSdobTeamConfirm()} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

export default SdobTeamConfirm;
