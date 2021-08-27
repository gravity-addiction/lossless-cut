import React, { memo } from 'react';
import { IoIosCamera } from 'react-icons/io';
import { FaTrashAlt } from 'react-icons/fa';
import { MdRotate90DegreesCcw } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

import { primaryTextColor } from './colors';

import ExportButton from './components/ExportButton';
import SdobExportButton from './components/SdobExportButton';
import SdobSetExitButton from './components/SdobSetExitButton';
import SdobSetSlateButton from './components/SdobSetSlateButton';
import ToggleExportConfirm from './components/ToggleExportConfirm';


const RightMenu = memo(({
  isRotationSet, rotation, areWeCutting, increaseRotation, cleanupFiles, renderCaptureFormatButton,
  capture, onExportPress, enabledOutSegments, hasVideo, autoMerge, exportConfirmEnabled, toggleExportConfirmEnabled,
  simpleMode, onSdobSetExitPress, onSdobSetSlatePress,
}) => {
  const rotationStr = `${rotation}°`;

  const { t } = useTranslation();

  return (
    <div className="no-user-select" style={{ padding: '.3em', display: 'flex', alignItems: 'center' }}>

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
