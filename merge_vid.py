# pip install pip3 install ffmpeg-normalize

import glob
import subprocess
import shutil
import os

# os.environ["FFMPEG_PATH"] = "./ffmpeg-4.2.1-amd64-static/"
# FFMPEG_PATH=./ffmpeg-4.2.1-amd64-static/
# os.environ["PATH"] += os.pathsep + "./ffmpeg-4.2.1-amd64-static/"
# PATH
my_env = os.environ.copy()
my_env["PATH"] = os.path.realpath("./ffmpeg-4.2.1-amd64-static/")+ ":" + my_env["PATH"]
FNULL = open(os.devnull, 'w')


input_recordings_path = "recordings/"
temp_path = "temp3/"
temp_loudnorm = "temp"
input_OP = "assets/1_Opening_trim.MP4"
input_yao = "assets/2_AndyIs_trim.MP4"
input_yeh = "assets/3_ChiayiIs_trim.MP4"
input_both = "assets/4_TheyAre_trim.MP4"
input_bless = "assets/5_Wishes_trim.MP4"
input_yao_parents = "assets/AndyParents.mp4"
input_yeh_parents = ""
concat_list = temp_path + "concat_list.txt"
output_file = "output.mkv"

o_width = "1920"
o_height = "1080"

# category is "Yeh" / "Yao" / "Both" / "Bless"
def get_file_list(category):
    file_list = []
    # grab categories
    for file in glob.glob(input_recordings_path + "*" + category + "_???_*.webm"):
        if not "(" in file:
            file_list.append(file)
    file_list.sort()
    # grab free
    for file in glob.glob(input_recordings_path + "*" + category + "_Free_*.webm"):
        if not "(" in file:
            file_list.append(file)

    return file_list

def construct_pre_process_command(input_file, output_file):
    return ('ffmpeg -i ' + input_file +
            ' -c:v vp9 -c:a libopus' +
            ' -max_muxing_queue_size 9999 -y -vf "scale=' + o_width + ':' + o_height + 
            ':force_original_aspect_ratio=decrease,pad='+ o_width + ':' + o_height +
            ':(ow-iw)/2:(oh-ih)/2" ' + output_file
           )

output_counter = 1
output_list = []
def pre_process_and_add_to_list(input_file):
    print "========================= " + input_file + " ===================="
    global output_counter
    output_counter += 1

    loudnorm_cmd = "ffmpeg-normalize " + input_file + " -f -o " + temp_path + temp_loudnorm + "%03d.mkv"%output_counter
    print loudnorm_cmd
    subprocess.call(loudnorm_cmd, shell=True, env = my_env, stdout=FNULL, stderr=FNULL)
    
    resize_cmd = construct_pre_process_command(temp_path + temp_loudnorm + "%03d.mkv"%output_counter, temp_path + "%03d.mkv"%output_counter)
    print resize_cmd
    subprocess.call(resize_cmd, shell=True, env = my_env, stdout=FNULL, stderr=FNULL)
    
    # resize_cmd = construct_pre_process_command(input_file, temp_path + "%03d.mkv"%output_counter)
    # print resize_cmd
    # # subprocess.call(resize_cmd, shell=True, env = my_env, stdout=FNULL, stderr=FNULL)
    # subprocess.call(resize_cmd, shell=True, env = my_env)

    output_list.append("%03d.mkv"%output_counter)

def copy_and_add_to_list(input_file):
    global output_counter
    output_counter += 1
    shutil.copy(input_file, temp_path + "%03d.mkv"%output_counter)
    output_list.append("%03d.mkv"%output_counter)


if not os.path.exists(temp_path):
    os.makedirs(temp_path)

yeh_list = get_file_list("Yeh")

for item in yeh_list:
    pre_process_and_add_to_list(item)

pre_process_and_add_to_list(input_yao_parents)
# copy_and_add_to_list(input_yao_parents)

yao_list = get_file_list("Yao")

for item in yao_list:
    pre_process_and_add_to_list(item)


f = open(temp_path+"video_order.txt", "w")
for item in output_list:
    f.write("file '" + item + "'\n")
f.close()

print "ffmpeg -y -f concat -safe 0 -i "+temp_path+"video_order.txt -c copy output.mkv"
# subprocess.Popen("ffmpeg -y -f concat -safe 0 -i "+temp_path+"video_order.txt -c copy output.mkv", shell=True)
# ffmpeg -f concat -safe 0 -i temp/video_order.txt -c copy output.mkv
subprocess.Popen("ffmpeg -y -f concat -safe 0 -i "+temp_path+"video_order.txt -c copy -fflags +genpts -async 1 output.mkv", shell=True)
  


# f = open("video_order.txt", "w")

# for item in yeh_list:
#     f.write("file '" + item + "'\n")

# for item in yao_list:
#     f.write("file '" + item + "'\n")

# for item in both_list:
#     f.write("file '" + item + "'\n")

# for item in bless_list:
#     f.write("file '" + item + "'\n")


# yao_list = []
# for file in glob.glob("Yao_???_*.webm"):
#     yao_list.append(file)
# yao_list.sort()


# both_list = []
# for file in glob.glob("Both_???_*.webm"):

# bless_list = []
