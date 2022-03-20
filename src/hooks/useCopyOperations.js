import { useCallback } from 'react';
import flatMap from 'lodash/flatMap';
import flatMapDeep from 'lodash/flatMapDeep';
import sum from 'lodash/sum';
import pMap from 'p-map';

import { getOutPath, transferTimestamps, getOutFileExtension, getOutDir, isMac } from '../util';
import { isCuttingStart, isCuttingEnd, handleProgress, getFfCommandLine, getFfmpegPath, getDuration, runFfmpeg, createChaptersFromSegments } from '../ffmpeg';

const execa = window.require('execa');
const { join } = window.require('path');
const fs = window.require('fs-extra');
const stringToStream = window.require('string-to-stream');
const cpy = window.require('cpy');
function useCopyOperations() {
  
  const copySource = useCallback(async ({ source, outPath, onProgress = () => {} }) => {
    console.log('Copying files',  source, 'to', outPath);
    // const process = execa('copy', [source, outPath]);
    onProgress(0);

    const fileStats = fs.statSync(source);
    const filesize = fileStats.size;
    let updateCnt = 0;
    return cpy(source, outPath).on('progress', progress => {
      updateCnt++;
      if (updateCnt > 50) {
        let porcentage = (((progress.completedSize || 0)/filesize)).toFixed(2)
        onProgress(porcentage);
        updateCnt = 0;
      }
    })
    /*
    return new Promise((res, rej) => {
    // console.time('copying')
      fs.stat(source, (err, stat) => {
        const filesize = stat.size
        let bytesCopied = 0

        const readStream = fs.createReadStream(source)

        readStream.on('data', (buffer) => {
          bytesCopied+= buffer.length
          let porcentage = ((bytesCopied/filesize)*100).toFixed(2)
          onProgress(porcentage / 100);
          // console.log(porcentage+'%') // run once with this and later with this line commented
        })
        readStream.on('error', (err) => {
          rej(err);
        });
        readStream.on('end', () => {
          // console.timeEnd('copying')
          res(outPath)
        })
        readStream.pipe(fs.createWriteStream(outPath));
      })
    });
    */


    // export function handleProgress(process, cutDuration, onProgress) {
    // onProgress(0);
/*  
    const rl = readline.createInterface({ input: process.stderr });
    rl.on('line', (line) => {
      console.log('progress', line);

      try {
        let match = line.match(/frame=\s*[^\s]+\s+fps=\s*[^\s]+\s+q=\s*[^\s]+\s+(?:size|Lsize)=\s*[^\s]+\s+time=\s*([^\s]+)\s+/);
        // Audio only looks like this: "line size=  233422kB time=01:45:50.68 bitrate= 301.1kbits/s speed= 353x    "
        if (!match) match = line.match(/(?:size|Lsize)=\s*[^\s]+\s+time=\s*([^\s]+)\s+/);
        if (!match) return;
  
        const str = match[1];
        // console.log(str);
        const progressTime = Math.max(0, moment.duration(str).asSeconds());
        // console.log(progressTime);
        const progress = cutDuration ? progressTime / cutDuration : 0;
        onProgress(progress);
      } catch (err) {
        console.log('Failed to parse ffmpeg progress line', err);
      }
    });
*/
    // }
    // handleProgress(process, totalDuration, onProgress);

    // stringToStream(concatTxt).pipe(process.stdin);

    const { stdout } = await process;
    console.log(stdout);
    
  }, []);

  return {
    copySource,
  };  
}

export default useCopyOperations;
