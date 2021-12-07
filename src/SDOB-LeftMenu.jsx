import React, { memo } from 'react';
import { Select } from 'evergreen-ui';
import { motion } from 'framer-motion';
import { FaYinYang } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import SimpleModeButton from './components/SimpleModeButton';
import { primaryColor } from './colors';
import { withBlur, toast } from './util';

const LeftMenu = memo(({ zoom, setZoom, invertCutSegments, setInvertCutSegments, toggleComfortZoom, simpleMode, toggleSimpleMode, closeFile, isFileOpened }) => {
  const { t } = useTranslation();

  function onYinYangClick() {
    setInvertCutSegments(v => {
      const newVal = !v;
      if (newVal) toast.fire({ title: t('When you export, selected segments on the timeline will be REMOVED - the surrounding areas will be KEPT') });
      else toast.fire({ title: t('When you export, selected segments on the timeline will be KEPT - the surrounding areas will be REMOVED.') });
      return newVal;
    });
  }

  const zoomOptions = Array(13).fill().map((unused, z) => 2 ** z);

  return (
    <div className="no-user-select" style={{ padding: '.3em', display: 'flex', flex: 1, alignItems: 'center' }}>
      <SimpleModeButton simpleMode={simpleMode} toggleSimpleMode={toggleSimpleMode} />

      {isFileOpened && (
        <div
          style={{ cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: 13, marginRight: 5 }}
          onClick={closeFile}
          title="Close File"
          role="button"
        >
          Close File
        </div>
      )}

      {!simpleMode && (
        <div style={{ marginLeft: 5 }}>
          <motion.div
            animate={{ rotateX: invertCutSegments ? 0 : 180, width: 26, height: 26 }}
            transition={{ duration: 0.3 }}
          >
            <FaYinYang
              size={26}
              role="button"
              title={invertCutSegments ? t('Discard selected segments') : t('Keep selected segments')}
              onClick={onYinYangClick}
            />
          </motion.div>
        </div>
      )}

      {!simpleMode && (
        <>
          <div role="button" style={{ marginRight: 5, marginLeft: 10 }} title={t('Zoom')} onClick={toggleComfortZoom}>{Math.floor(zoom)}x</div>

          <Select height={20} style={{ width: 65 }} value={zoomOptions.includes(zoom) ? zoom.toString() : ''} title={t('Zoom')} onChange={withBlur(e => setZoom(parseInt(e.target.value, 10)))}>
            <option key="" value="" disabled>{t('Zoom')}</option>
            {zoomOptions.map(val => (
              <option key={val} value={String(val)}>{t('Zoom')} {val}x</option>
            ))}
          </Select>
        </>
      )}


    </div>
  );
});

export default LeftMenu;
