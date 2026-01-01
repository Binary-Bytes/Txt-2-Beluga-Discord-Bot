import os
import sys
import requests
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip

def add_sounds(url, temp_video, folder_path, vid_id):
    # Load the video file
    video = VideoFileClip(temp_video)
    duration = 0
    audio_clips = []

    with requests.get(url) as response:
        if response.status_code == 200:
            name_up_next = True
            
            lines = response.text.splitlines()
            for line in lines:
                if line == '':
                    name_up_next = True
                    continue
                elif line.startswith('#'):
                    continue
                elif line.startswith("WELCOME"):
                    if "#!" in line:
                        parts = line.split('$^')
                        duration_part, sound_part = parts[1].split("#!")
                        audio_file = f'src/t2b/assets/sounds/mp3/{sound_part.strip()}.mp3'
                        audio_clip = AudioFileClip(audio_file).set_start(duration)
                        audio_clips.append(audio_clip)
                        duration += float(duration_part)
                    else:
                        duration += float(line.split('$^')[1])
                elif name_up_next:
                    name_up_next = False
                    continue
                else:
                    if "#!" in line:
                        parts = line.split('$^')
                        duration_part, sound_part = parts[1].split("#!")
                        audio_file = f'src/t2b/assets/sounds/mp3/{sound_part.strip()}.mp3'
                        audio_clip = AudioFileClip(audio_file).set_start(duration)
                        audio_clips.append(audio_clip)
                        duration += float(duration_part)
                    else:
                        duration += float(line.split('$^')[1])
    
    if len(audio_clips) > 0:
        composite_audio = CompositeAudioClip(audio_clips)
        video = video.set_audio(composite_audio)
    else:
        pass

    final_video = os.path.join(folder_path, f'{vid_id}.mp4')
    video.write_videofile(final_video, codec="libx264", audio_codec="aac")
    os.remove(temp_video)
    sys.stdout.flush()