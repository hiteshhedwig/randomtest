import re
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import yt_dlp
import logging
import asyncio
import urllib.parse
import cloudscraper
import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://whale-app-o4uqw.ondigitalocean.app:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Estimated-FileSize", "X-Original-Filename"],
)

class VideoURL(BaseModel):
    url: str


def identify_platform(url):
    patterns = {
        'youtube': r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/',
        'twitter': r'(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/',
        'vimeo': r'(?:https?:\/\/)?(?:www\.)?vimeo\.com\/',
        '9gag': r'(?:https?:\/\/)?(?:www\.)?9gag\.com\/',
        'instagram': r'(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/',
        'facebook': r'(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch)\/',
        'twitch': r'(?:https?:\/\/)?(?:www\.)?twitch\.tv\/'
    }
    
    for platform, pattern in patterns.items():
        if re.match(pattern, url):
            return platform
    return 'unknown'

def process_twitch(url):
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    thumbnail_url = info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url')

    formats = [
        {
            "format_id": format['format_id'],
            "ext": format.get('ext', 'unknown'),
            "resolution": f"{format.get('width', 'N/A')}x{format.get('height', 'N/A')}",
            "filesize": format.get('filesize', 'N/A'),
            "url": format.get('url')
        }
        for format in info.get('formats', []) if format.get('vcodec') != 'none'
    ]

    return {
        "title": info.get('title', 'Twitch Video'),
        "duration": info.get('duration', 0),
        "thumbnail_url": thumbnail_url,
        "formats": formats
    }


def process_twitter(url):
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    thumbnail_url = info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url')

    formats = [
        {
            "format_id": format['format_id'],
            "ext": format.get('ext', 'unknown'),
            "resolution": f"{format.get('width', 'N/A')}x{format.get('height', 'N/A')}",
            "filesize": format.get('filesize', 'N/A'),
            "url": format.get('url')
        }
        for format in info.get('formats', []) if format.get('vcodec') != 'none'
    ]

    return {
        "title": info.get('title', 'Twitter Video'),
        "duration": info.get('duration', 0),
        "thumbnail_url": thumbnail_url,
        "formats": formats
    }

def process_9gag(url):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get(url)
        
        # Wait for the video element to load
        video_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "video"))
        )
        
        # Extract video information
        video_url = video_element.get_attribute('src')
        title_element = driver.find_element(By.CSS_SELECTOR, "h1.post-title")
        title = title_element.text if title_element else "9gag video"
        
        return {
            "title": title,
            "duration": 0,  # 9gag doesn't provide duration easily
            "thumbnail_url": "",  # You could extract this if needed
            "formats": [
                {
                    "format_id": "9gag_default",
                    "ext": "mp4",
                    "resolution": "unknown",
                    "filesize": "N/A",
                    "url": video_url
                }
            ]
        }
    finally:
        driver.quit()

def process_vimeo(url):
    scraper = cloudscraper.create_scraper()
    video_id = url.split('/')[-1]
    config_url = f"https://player.vimeo.com/video/{video_id}/config"
    
    response = scraper.get(config_url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch Vimeo config: {response.status_code}")
    
    config = json.loads(response.text)
    video_data = config['video']
    
    title = video_data['title']
    duration = video_data['duration']
    thumbnail_url = video_data['thumbs']['640']
    
    progressive_files = video_data.get('progressive', [])
    formats = [
        {
            "format_id": f"vimeo_{f['quality']}",
            "ext": "mp4",
            "resolution": f"{f['width']}x{f['height']}",
            "filesize": f.get('size', 'N/A'),
            "url": f['url']
        }
        for f in progressive_files
    ]
    
    return {
        "title": title,
        "duration": duration,
        "thumbnail_url": thumbnail_url,
        "formats": formats
    }

def process_instagram(url):
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    thumbnail_url = info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url')

    formats = [
        {
            "format_id": format['format_id'],
            "ext": format.get('ext', 'unknown'),
            "resolution": f"{format.get('width', 'N/A')}x{format.get('height', 'N/A')}",
            "filesize": format.get('filesize', 'N/A'),
            "url": format.get('url')
        }
        for format in info.get('formats', []) if format.get('vcodec') != 'none'
    ]

    return {
        "title": info.get('title', 'Instagram Video'),
        "duration": info.get('duration', 0),
        "thumbnail_url": thumbnail_url,
        "formats": formats
    }

def process_facebook(url):
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    thumbnail_url = info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url')

    formats = [
        {
            "format_id": format['format_id'],
            "ext": format.get('ext', 'unknown'),
            "resolution": f"{format.get('width', 'N/A')}x{format.get('height', 'N/A')}",
            "filesize": format.get('filesize', 'N/A'),
            "url": format.get('url')
        }
        for format in info.get('formats', []) if format.get('vcodec') != 'none'
    ]

    return {
        "title": info.get('title', 'Facebook Video'),
        "duration": info.get('duration', 0),
        "thumbnail_url": thumbnail_url,
        "formats": formats
    }

@app.post("/process-video")
async def process_video(video: VideoURL):
    try:
        platform = identify_platform(video.url)
        
        if platform == 'vimeo':
            return process_vimeo(video.url)
        elif platform == '9gag':
            return process_9gag(video.url)
        elif platform == 'instagram':
            return process_instagram(video.url)
        elif platform == 'facebook':
            return process_facebook(video.url)
        elif platform == 'twitter':
            return process_twitter(video.url)
        elif platform == 'twitch':
            return process_twitch(video.url)
        
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video.url, download=False)
        
        thumbnail_url = info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url')

        video_formats = [f for f in info['formats'] if f.get('vcodec') != 'none']
        video_formats.sort(key=lambda x: (x.get('height', 0), x.get('filesize', 0)), reverse=True)
        top_formats = video_formats[:10]

        return {
            "title": info['title'],
            "duration": info.get('duration', 0),
            "thumbnail_url": thumbnail_url,
            "formats": [
                {
                    "format_id": format['format_id'],
                    "ext": format.get('ext', 'unknown'),
                    "resolution": f"{format.get('width', 'N/A')}x{format.get('height', 'N/A')}",
                    "filesize": format.get('filesize', 'N/A'),
                }
                for format in top_formats
            ]
        }
    except Exception as e:
        logger.error(f"Error in process_video: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/download")
async def download_video(url: str = Query(...), format_id: str = Query(...)):
    try:
        platform = identify_platform(url)
        
        if platform == 'vimeo':
            video_info = process_vimeo(url)
            format_info = next((f for f in video_info['formats'] if f['format_id'] == format_id), None)
            if not format_info:
                raise HTTPException(status_code=400, detail="Invalid format selected")
            
            scraper = cloudscraper.create_scraper()
            response = scraper.get(format_info['url'], stream=True)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to start download")
            
            filename = f"{video_info['title']}.{format_info['ext']}"
            encoded_filename = urllib.parse.quote(filename)
            
            headers = {
                'Content-Disposition': f"attachment; filename*=UTF-8''{encoded_filename}",
                'Content-Type': 'video/mp4',
                'Transfer-Encoding': 'chunked',
            }
            
            return StreamingResponse(response.iter_content(chunk_size=8192), headers=headers)
        
        # For other platforms, use yt-dlp to get video info first
        ydl_opts = {
            'format': f'{format_id}+bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            title = info['title']
            ext = info['ext']
            filename = f"{title}.{ext}"

            print("filename ", filename)
            
            encoded_filename = urllib.parse.quote(filename)

            print("encoded_filename ", encoded_filename)

            
            format_info = next((f for f in info['formats'] if f['format_id'] == format_id), None)
            estimated_filesize = format_info.get('filesize') if format_info else None
            
            logger.info(f"Starting download for video: {title}")
            logger.info(f"Estimated file size: {estimated_filesize} bytes")

        async def stream_video():
            cmd = [
                'yt-dlp',
                '-f', f'{format_id}+bestaudio/best',
                '-o', '-',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                url
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            try:
                while True:
                    chunk = await process.stdout.read(8192)
                    if not chunk:
                        break
                    yield chunk
                await process.wait()
                if process.returncode != 0:
                    stderr = await process.stderr.read()
                    logger.error(f"yt-dlp process failed with return code {process.returncode}. Error: {stderr.decode()}")
                    raise Exception("Download process failed")
            except Exception as e:
                logger.error(f"Error during video streaming: {str(e)}")
                raise

        headers = {
            'Content-Disposition': f"attachment; filename*=UTF-8''{encoded_filename}",
            'Content-Type': 'application/octet-stream',
            'Transfer-Encoding': 'chunked',
            'X-Estimated-FileSize': str(estimated_filesize) if estimated_filesize else '',
            'X-Original-Filename': encoded_filename
        }
        
        print("headers ", headers)


        logger.info(f"Streaming response for video: {title}")
        return StreamingResponse(stream_video(), headers=headers)

    except Exception as e:
        logger.error(f"Error in download_video: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)