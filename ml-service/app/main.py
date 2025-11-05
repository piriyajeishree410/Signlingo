# ml-service/app/main.py  (only the relevant parts)

from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
import numpy as np, cv2, os

from .inference_classifier import InferenceClassifier
from .dynamic_detector import DynamicDetector

HERE = os.path.dirname(__file__)
MODELS_DIR = os.path.join(HERE, "..", "models")

app = FastAPI(title="SignLingo ML Service")

# Instantiate models once on startup
clf_letters = None
det_gestures = None

@app.on_event("startup")
def _load_models():
    global clf_letters, det_gestures
    try:
        clf_letters = InferenceClassifier(
            model_path=os.path.join(MODELS_DIR, "model.p")
        )
        print("[OK] Letters (scikit-learn) loaded.")
    except Exception as e:
        print("[WARN] Letters model load failed:", e)

    try:
        det_gestures = DynamicDetector(
            weights_path=os.path.join(MODELS_DIR, "dynamic_model.h5"),
            label_map_path=os.path.join(MODELS_DIR, "label_map.npy"),
        )
        print("[OK] Gestures (keras) loaded.")
    except Exception as e:
        print("[WARN] Gestures model load failed:", e)

def _bytes_to_bgr(b: bytes):
    arr = np.frombuffer(b, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img

@app.post("/detect")
async def detect(image: UploadFile = File(...), mode: str = Query("letters", pattern="^(letters|gestures)$")):
    try:
        buf = await image.read()
        frame = _bytes_to_bgr(buf)
        if frame is None:
            return JSONResponse({"error": "bad image"}, status_code=400)

        if mode == "letters" and clf_letters:
            label, conf = clf_letters.predict(frame)
        elif mode == "gestures" and det_gestures:
            label, conf = det_gestures.predict(frame)
        else:
            label, conf = None, 0.0

        # Demo fallback if still warming up / not enough frames
        if label is None:
            return {"label": "...", "confidence": 0.0, "mode": mode}

        return {"label": label, "confidence": float(conf), "mode": mode}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
