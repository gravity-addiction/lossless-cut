import React, { memo, useCallback, useRef, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { primaryTextColor, primaryColor } from './colors';
import { isDurationValid } from './segments';
import SDOBShim from './SDOBShim';

const SDOB = memo(({ filePath, duration, playerTime, workingRef, updateSegAtIndex, cutSegments, setCurrentSegIndex, addSegment }) => {
  const sdobRef = useRef();

  const sdobShim = useMemo(() => SDOBShim(), []);
  const onSdobSetSlate = useCallback(async () => {
    if (workingRef.current || !filePath || !isDurationValid(duration)) {
      return;
    }

    // if (!sdobSelectedComp) {
    //   errorToast('Must Select a Competition');
    //   return;
    // }

    const myTeams = sdobShim.getTeams();
    console.log('Teams', myTeams);
    // const slateSegment = (myComp.segments || []).find((seg) => seg.name == 'slate');
    // console.log('Got Slate Seg', slateSegment);
    // if (!slateSegment) {
    //   errorToast('No Slate needed for this video');
    //   return;
    // }
    const slateSegment = { pre: 2, post: 3 };
    console.log(playerTime);
    console.log(duration);
    if (cutSegments && cutSegments.length < 1) {
      addSegment();
    }

    try {
      setCurrentSegIndex(0);
      updateSegAtIndex(0, {
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
    if (cutSegments && cutSegments.length < 1) {
      addSegment();
    }
    if (cutSegments && cutSegments.length < 2) {
      addSegment();
    }
    setCurrentSegIndex(1);
    updateSegAtIndex(1, {
      start: Math.min(Math.max(playerTime - exitSegment.pre, 0), duration),
      end: Math.min(Math.max(playerTime + exitSegment.post, 0), duration)
    });
  }, [workingRef, filePath, duration, cutSegments, setCurrentSegIndex, updateSegAtIndex, playerTime, addSegment]);

  return (
    <div class="d-flex flex-direction-row">
      <div
        style={{ cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: 13, marginRight: 5 }}
        onClick={onSdobSetSlate}
        title="Set Slate"
        role="button"
      >Set Slate</div>
      <div
        style={{ cursor: 'pointer', background: primaryColor, borderRadius: 5, paddingTop: 1, paddingBottom: 2.5, paddingLeft: 7, paddingRight: 7, fontSize: 13, marginRight: 5 }}
        onClick={onSdobSetExitPress}
        title="Set Exit"
        role="button"
      >Set Exit</div>
    </div>
  );
});

export default SDOB;
