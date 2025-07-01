# 🧠 Deepfake Detection

A simple deepfake detection system using a Convolutional Neural Network (CNN).  
This app allows you to determine whether a video has been manipulated using deepfake techniques.

---

## 🚀 Features

- Detects whether a video is **real or fake**.
- Uses a **CNN-based model** trained on the **FaceForensics++** dataset.
- Web API built with **FastAPI** for easy interaction.
- Simple UI: open the HTML file in your browser using **Live Server** mode.

---

## 📦 Dataset: FaceForensics++

If you want to train the model from scratch, download the **FaceForensics++** dataset.

Use the script included in the project to download it:

```bash
python faceforensics_download_v4.py -d all -c c23 -t videos --num_videos 1000 --server EU2 ./faceforensics_data_100
```

##🛠 Installation
Clone the repository:

``` git clone https://github.com/yourusername/deepfake_detection.git cd deepfake_detection```

Install the required Python packages:

```pip install -r requirements.txt```
Or install manually:

``` pip install uvicorn fastapi keras==2.10.0 numpy==1.23.5 opencv-python==4.11.0.86 pillow==11.2.1 \
scikit-learn==1.7.0 scipy==1.15.3 sniffio==1.3.1 starlette==0.46.2 tensorboard==2.10.1 \
tensorboard-data-server==0.6.1 tensorboard-plugin-wit==1.8.1 tensorflow==2.10.0 \
tensorflow-estimator==2.10.0 tensorflow-intel==2.12.0 tensorflow-io-gcs-filesystem==0.31.0 \
tqdm==4.67.1
```
