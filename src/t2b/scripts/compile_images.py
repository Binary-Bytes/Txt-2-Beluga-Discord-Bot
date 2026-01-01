import os
import requests
from sound_effects import add_sounds

def gen_vid(url, folder_path, vid_id):
    input_folder = os.path.join(folder_path, 'chat')
    image_files = sorted([f for f in os.listdir(input_folder) if f.endswith('.png')])

    # Read durations from the file.
    durations = []
    with requests.get(url) as response:
        if response.status_code == 200:
            name_up_next = True
            
            lines = response.text.splitlines()
            for line in lines:
                    if line == '':
                        name_up_next = True
                        continue
                    elif line[0] == '#':
                        continue
                    elif line.startswith("WELCOME"):
                        if "#!" in line:
                            durations.append(line.split('$^')[1].split("#!")[0])
                        else:
                            durations.append(line.split('$^')[1])
                        continue
                    elif name_up_next == True:
                        name_up_next = False
                        continue
                    else:
                        if "#!" in line:
                            durations.append(line.split('$^')[1].split("#!")[0])
                        else:
                            durations.append(line.split('$^')[1])
                
                
    # Create a text file to store the image paths
    image_paths = os.path.join(folder_path, 'image_paths.txt')
    with open(image_paths, 'w') as file:    
        count = 0
        for image_file in image_files:
            # Use absolute path for image files
            abs_path = os.path.abspath(os.path.join(input_folder, image_file))
            file.write(f"file '{abs_path}'\noutpoint {durations[count]}\n")
            count += 1
        file.write(f"file '{os.path.abspath(os.path.join(input_folder, image_files[-1]))}'\noutpoint 0.04\n")

    temp_video = os.path.join(folder_path, f'{vid_id}_temp.mp4')
    video_width, video_height = 1280, 720
    ffmpeg_cmd = f"ffmpeg -f concat -safe 0 -i {image_paths} -vcodec libx264 -r 25 -crf 25 -vf \"scale={video_width}:{video_height}:force_original_aspect_ratio=decrease, pad={video_width}:{video_height}:(ow-iw)/2:(oh-ih)/2\" -pix_fmt yuv420p {temp_video}"
    os.system(ffmpeg_cmd)
    os.remove(image_paths)

    add_sounds(url, temp_video, folder_path, vid_id)