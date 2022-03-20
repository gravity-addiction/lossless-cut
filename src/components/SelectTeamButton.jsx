import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { primaryColor } from '../colors';


const SelectTeamButton = memo(({ onClick, size = 1 }) => {
  const { t } = useTranslation();

  const selectTeamButtonText = 'Select Team';

  return (
    <div
      style={{ cursor: 'pointer', background: primaryColor, borderRadius: size * 5, paddingTop: size * 1, paddingBottom: size * 2.5, paddingLeft: size * 7, paddingRight: size * 7, fontSize: size * 13 }}
      onClick={onClick}
      title={selectTeamButtonText}
      role="button"
    >
      {selectTeamButtonText}
    </div>
  );
});

export default SelectTeamButton;
