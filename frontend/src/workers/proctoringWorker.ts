self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  switch (type) {
    case 'brightness-check': {
      const { imageData } = data;
      let total = 0;
      const len = imageData.data.length;
      for (let i = 0; i < len; i += 4) {
        total += imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114;
      }
      const avg = total / (imageData.width * imageData.height);
      self.postMessage({ type: 'brightness-result', data: { avg, isLow: avg < 40 } });
      break;
    }

    case 'motion-detection': {
      const { current, previous, width, height, threshold } = data;
      let changedPixels = 0;
      const total = width * height;
      for (let i = 0; i < current.data.length; i += 4) {
        const diff = Math.abs(current.data[i] - previous.data[i]) +
          Math.abs(current.data[i + 1] - previous.data[i + 1]) +
          Math.abs(current.data[i + 2] - previous.data[i + 2]);
        if (diff > (threshold || 30)) changedPixels++;
      }
      const motionRatio = changedPixels / total;
      self.postMessage({ type: 'motion-result', data: { motionRatio, hasMotion: motionRatio > 0.01 } });
      break;
    }

    case 'frame-analyze': {
      const { imageData, width, height } = data;
      let totalPixels = 0;
      let nonBlackPixels = 0;
      const len = imageData.data.length;
      for (let i = 0; i < len; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        totalPixels++;
        if (r > 10 || g > 10 || b > 10) nonBlackPixels++;
      }
      const coverage = nonBlackPixels / Math.max(totalPixels, 1);
      const isFrozen = coverage < 0.005;
      self.postMessage({
        type: 'frame-result',
        data: { coverage, isFrozen, totalPixels, nonBlackPixels },
      });
      break;
    }

    case 'audio-analyze': {
      const { samples } = data;
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        const val = (samples[i] - 128) / 128;
        sum += val * val;
        peak = Math.max(peak, Math.abs(val));
      }
      const rms = Math.sqrt(sum / samples.length);
      self.postMessage({
        type: 'audio-result',
        data: { rms, peak, isSilent: rms < 0.02, isLoud: rms > 0.8 },
      });
      break;
    }

    case 'noise-detection': {
      const { samples } = data;
      let sum = 0;
      const mean = 128;
      for (let i = 0; i < samples.length; i++) {
        sum += (samples[i] - mean) ** 2;
      }
      const variance = sum / samples.length;
      const isHighNoise = variance > 1500;
      self.postMessage({
        type: 'noise-result',
        data: { variance, isHighNoise },
      });
      break;
    }
  }
};
