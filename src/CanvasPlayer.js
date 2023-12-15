const remote = window.require('@electron/remote');
import { BarcodeFormat } from '@zxing/library';

const { command, abortAll } = remote.require('./canvasPlayer');
import { BaseLoggger, Html5QrcodeSupportedFormats } from '../html5-qrcode/src/core';
import { ZXingHtml5QrcodeDecoder } from '../html5-qrcode/src/zxing-html5-qrcode-decoder';


export default ({ path, width: inWidth, height: inHeight, streamIndex, getCanvas, gotQR, setGotQR }) => {
  let terminated;

  const logger = new BaseLoggger(false);
  const qr = new ZXingHtml5QrcodeDecoder(
    [
      [Html5QrcodeSupportedFormats.QR_CODE, BarcodeFormat.QR_CODE ],
      // [Html5QrcodeSupportedFormats.AZTEC, BarcodeFormat.AZTEC ],
      // [Html5QrcodeSupportedFormats.CODABAR, BarcodeFormat.CODABAR ],
      // [Html5QrcodeSupportedFormats.CODE_39, BarcodeFormat.CODE_39 ],
      // [Html5QrcodeSupportedFormats.CODE_93, BarcodeFormat.CODE_93 ],
      // [ Html5QrcodeSupportedFormats.CODE_128, BarcodeFormat.CODE_128 ],
      // [
      //     Html5QrcodeSupportedFormats.DATA_MATRIX,
      //     BarcodeFormat.DATA_MATRIX ],
      // [
      //     Html5QrcodeSupportedFormats.MAXICODE,
      //     BarcodeFormat.MAXICODE ],
      // [Html5QrcodeSupportedFormats.ITF, BarcodeFormat.ITF ],
      // [Html5QrcodeSupportedFormats.EAN_13, BarcodeFormat.EAN_13 ],
      // [Html5QrcodeSupportedFormats.EAN_8, BarcodeFormat.EAN_8 ],
      // [Html5QrcodeSupportedFormats.PDF_417, BarcodeFormat.PDF_417 ],
      // [Html5QrcodeSupportedFormats.RSS_14, BarcodeFormat.RSS_14 ],
      // [
      //     Html5QrcodeSupportedFormats.RSS_EXPANDED,
      //     BarcodeFormat.RSS_EXPANDED ],
      // [Html5QrcodeSupportedFormats.UPC_A, BarcodeFormat.UPC_A ],
      // [Html5QrcodeSupportedFormats.UPC_E, BarcodeFormat.UPC_E ],
      // [
      //     Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
      //     BarcodeFormat.UPC_EAN_EXTENSION ]      
    ],
    false,
    logger
  );

  function drawOnCanvas(rgbaImage, width, height) {
    const canvas = getCanvas();
    if (!canvas || rgbaImage.length === 0) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // https://developer.mozilla.org/en-US/docs/Web/API/ImageData/ImageData
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
    ctx.putImageData(new ImageData(Uint8ClampedArray.from(rgbaImage), width, height), 0, 0);

    if (!gotQR) {
      qr.decodeAsync(canvas).then((result) => {
        console.log(result);
        gotQR = result;
        setGotQR(true);
      }).catch(() => { });
    }
  }

  function pause(seekTo) {
    if (terminated) return;
    abortAll();
    command({ path, inWidth, inHeight, streamIndex, seekTo, onFrame: drawOnCanvas, playing: false });
  }

  function play(playFrom) {
    if (terminated) return;
    abortAll();
    command({ path, inWidth, inHeight, streamIndex, seekTo: playFrom, onFrame: drawOnCanvas, playing: true });
  }

  function terminate() {
    if (terminated) return;
    terminated = true;
    abortAll();
  }

  return {
    play,
    pause,
    terminate,
  };
};
