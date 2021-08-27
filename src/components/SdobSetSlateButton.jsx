import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { primaryColor } from '../colors';


const SdobSetSlateButton = memo(({ onClick, size = 1 }) => {
  const { t } = useTranslation();

  const buttonTitle = t('Set Slate');
  const buttonText = t('Set Slate');

  return (
    <div
      style={{ cursor: 'pointer', background: primaryColor, borderRadius: size * 5, paddingTop: size * 1, paddingBottom: size * 2.5, paddingLeft: size * 7, paddingRight: size * 7, fontSize: size * 13, marginRight: 5 }}
      onClick={onClick}
      title={buttonTitle}
      role="button"
    >
      {buttonText}
    </div>
  );
});

export default SdobSetSlateButton;
