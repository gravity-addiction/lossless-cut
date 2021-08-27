import React, { memo } from 'react';
import { FaHandPointRight, FaHandPointLeft } from 'react-icons/fa';

import i18n from 'i18next';
import { useTranslation, Trans } from 'react-i18next';

import SetCutpointButton from './components/SetCutpointButton';
import SimpleModeButton from './components/SimpleModeButton';

const electron = window.require('electron');

const NoFileLoaded = memo(({ topBarHeight, bottomBarHeight, mifiLink, toggleHelp, currentCutSeg, simpleMode, toggleSimpleMode, onSdobOpenFileClick }) => {
  const { t } = useTranslation();

  return (
    <div className="no-user-select" style={{ position: 'fixed', left: 0, right: 0, top: topBarHeight, bottom: bottomBarHeight, border: '2vmin dashed #252525', color: '#505050', margin: '5vmin', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }} onClick={onSdobOpenFileClick}>
      <div style={{ fontSize: '4vmin', textTransform: 'uppercase' }}>{t('Click Here')} or</div>
      <div style={{ fontSize: '6vmin', textTransform: 'uppercase' }}>{t('DROP FILE(S)')}</div>

      <div style={{ fontSize: '3vmin', color: '#ccc', marginTop: '3vmin' }}>
        <Trans><SetCutpointButton currentCutSeg={currentCutSeg} side="start" Icon={FaHandPointLeft} style={{ verticalAlign: 'middle' }} /> <SetCutpointButton currentCutSeg={currentCutSeg} side="end" Icon={FaHandPointRight} style={{ verticalAlign: 'middle' }} /> to set cutpoints</Trans>
      </div>
    </div>
  );
});

export default NoFileLoaded;
