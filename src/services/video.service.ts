import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const VideoService = {
  async getFFmpeg() {
    if (ffmpeg) return ffmpeg;
    
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    return ffmpeg;
  },

  async extractAudio(videoFile: File): Promise<Blob> {
    const ffmpeg = await this.getFFmpeg();
    const inputName = 'input' + videoFile.name.substring(videoFile.name.lastIndexOf('.'));
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
    
    // -vn: disable video, -ab: audio bitrate
    await ffmpeg.exec(['-i', inputName, '-vn', '-ab', '128k', '-ar', '44100', '-y', outputName]);
    
    const data = await ffmpeg.readFile(outputName);
    return new Blob([data as any], { type: 'audio/mp3' });
  }
};
