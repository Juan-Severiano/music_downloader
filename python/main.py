import os
import yt_dlp
from youtubesearchpython import VideosSearch

def search_youtube_video(query):
    try:
        search = VideosSearch(query, limit=1)
        result = search.result()
        video_url = result['result'][0]['link']
        return video_url
    except Exception as e:
        print(f"Erro ao buscar '{query}': {e}")
        return None

def download_video_as_mp3(url, output_path):
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{output_path}/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        print(f"Download e conversão finalizados: {url}")
    except Exception as e:
        print(f"Erro ao baixar/converter o vídeo: {e}")

def download_music_list(file_path, output_path):
    with open(file_path, 'r') as f:
        queries = f.readlines()

    for query in queries:
        query = query.strip()
        if query:
            print(f"Buscando no YouTube: {query}")
            video_url = search_youtube_video(query)
            if video_url:
                print(f"Baixando: {video_url}")
                download_video_as_mp3(video_url, output_path)

music_list_file = "songs.txt"
output_directory = "downloaded_songs"

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

download_music_list(music_list_file, output_directory)
