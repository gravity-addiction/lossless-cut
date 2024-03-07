import React, { memo, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Html5QrcodeScanner } from '../html5-qrcode/src/html5-qrcode-scanner';

const QrReader = memo(({ rotate, filePath, playerTime, commandedTime, playing, gotQR, setGotQR }) => {
  
  function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
  }
  
  function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.log(`Code scan error`, error);
  }
  
  let html5QrcodeScanner;
  
  const state = useMemo(() => {
    if (playing) {
      return { startTime: commandedTime, playing };
    }
    return { startTime: playerTime, playing };
  }, [commandedTime, playerTime, playing]);

  const [debouncedState, { cancel }] = useDebounce(state, 200, {
    equalityFn: (a, b) => a.startTime === b.startTime && a.playing === b.playing,
  });

  /* useEffect(() => {
    console.log('state', state);
  }, [state]); */

  useEffect(() => () => {
    cancel();
  }, [cancel]);

  useMemo(() => {

    console.log('debouncedState', debouncedState);
    if (!html5QrcodeScanner) {
      console.log('Create Scanner');
      setTimeout(() => {
        html5QrcodeScanner = new Html5QrcodeScanner("reader",
          { fps: 10,
            qrbox: 250,
            formatsToSupport: [0]
          },
          true
        );
        console.log('Rendering!')
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      }, 5000);
    }
    if (debouncedState.startTime == null) return;
  
    // if (debouncedState.playing) {

    // } else {
    
    // }
  }, [debouncedState]);
  

  return (
    <div id="reader" style={{ width: '100%', height: '100%', left: 0, right: 0, top: 0, bottom: 0, position: 'absolute', overflow: 'hidden', background: 'transparent' }}>
      <canvas></canvas>
    </div>
  );
});

export default QrReader;
