from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from predict_video import check_video
import shutil
import tempfile
import os
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://127.0.0.1:5500"] if using Live Server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_message():
    return {"message":"is work"}

@app.post("/analyze/")
async def analyze_video(file: UploadFile = File(...)):
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # Call your existing function
    try:
        result = check_video(tmp_path)
        # result = process_video(tmp_path)
        return {
            "success": True,
            "result": result["result"],
            "confidence": result["confidence"],
            "frames": result["extracted_frames"],
            "faces": result["detected_faces"]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        os.unlink(tmp_path)
