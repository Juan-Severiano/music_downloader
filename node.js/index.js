const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const YouTubeSearchApi = require('youtube-search-api');

ffmpeg.setFfmpegPath(ffmpegPath);

async function searchYouTube(query) {
  try {
    // TODO: the debugger says:
    // ! TypeError: YouTubeSearchApi.GetData is not a function
    const result = await YouTubeSearchApi.GetData(query, 1);
    
    if (result.items.length > 0) {
      return `https://www.youtube.com/watch?v=${result.items[0].id}`;
    } else {
      console.log(`Nenhum vídeo encontrado para "${query}"`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar "${query}":`, error);
    return null;
  }
}

function downloadAndConvertToMP3(videoUrl, outputDir) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, { filter: 'audioonly' });
    const videoID = ytdl.getURLVideoID(videoUrl);
    const outputPath = `${outputDir}/${videoID}.mp3`;

    ffmpeg(stream)
      .audioBitrate(192)
      .save(outputPath)
      .on('end', () => {
        console.log(`Download e conversão finalizados: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Erro durante o download/conversão:', err);
        reject(err);
      });
  });
}

async function downloadMusicList(filePath, outputDir) {
  const queries = fs.readFileSync(filePath, 'utf-8').split('\n').map(q => q.trim()).filter(q => q);
  
  for (const query of queries) {
    console.log(`Buscando no YouTube: ${query}`);
    const videoUrl = await searchYouTube(query);
    
    if (videoUrl) {
      console.log(`Baixando: ${videoUrl}`);
      try {
        await downloadAndConvertToMP3(videoUrl, outputDir);
      } catch (error) {
        console.error(`Erro ao processar "${query}":`, error);
      }
    }
  }
}

const musicListFile = 'songs.txt';
const outputDirectory = 'downloaded_songs';

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

downloadMusicList(musicListFile, outputDirectory);
