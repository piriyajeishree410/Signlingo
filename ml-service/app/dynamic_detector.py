# ml-service/app/dynamic_detector.py
import os
import json
import h5py
from collections import deque
from typing import Tuple, Optional, List

import cv2
import numpy as np
import mediapipe as mp
from tensorflow import keras


SEQUENCE_LENGTH = 30
MIN_VALID_RATIO = 0.6  # % frames that must have landmarks to run prediction


def _patch_h5_inplace(path: str) -> bool:
    changed = False
    with h5py.File(path, "r+") as f:
        cfg = f.attrs.get("model_config")
        if cfg is None:
            return False
        if isinstance(cfg, bytes):
            cfg = cfg.decode("utf-8")
        data = json.loads(cfg)

        def normalize_dtype_field(conf: dict, key: str):
            nonlocal changed
            if key not in conf:
                return
            val = conf[key]
            if isinstance(val, dict) and val.get("class_name") == "DTypePolicy":
                conf[key] = "float32"; changed = True
            elif isinstance(val, str):
                conf.pop(key, None); changed = True
            else:
                conf.pop(key, None); changed = True

        def walk(obj):
            nonlocal changed
            if isinstance(obj, dict):
                if obj.get("class_name") == "InputLayer":
                    conf = obj.get("config", {})
                    if "batch_shape" in conf and "batch_input_shape" not in conf:
                        conf["batch_input_shape"] = conf.pop("batch_shape"); changed = True
                    normalize_dtype_field(conf, "dtype")
                    normalize_dtype_field(conf, "dtype_policy")
                if "config" in obj and isinstance(obj["config"], dict):
                    normalize_dtype_field(obj["config"], "dtype")
                    normalize_dtype_field(obj["config"], "dtype_policy")
                for v in obj.values(): walk(v)
            elif isinstance(obj, list):
                for v in obj: walk(v)

        walk(data)
        if changed:
            f.attrs["model_config"] = json.dumps(data).encode("utf-8")
    return changed


def load_model_compat(path: str):
    try:
        with keras.utils.custom_object_scope({"DTypePolicy": keras.mixed_precision.Policy}):
            return keras.models.load_model(path, compile=False)
    except Exception as e:
        msg = str(e)
    if _patch_h5_inplace(path):
        try:
            with keras.utils.custom_object_scope({"DTypePolicy": keras.mixed_precision.Policy}):
                return keras.models.load_model(path, compile=False)
        except Exception as e2:
            msg = f"{msg}\n(after patch) {e2}"
    with h5py.File(path, "r") as f:
        cfg = f.attrs.get("model_config")
        if cfg is None:
            raise RuntimeError("H5 missing 'model_config'.")
        if isinstance(cfg, bytes):
            cfg = cfg.decode("utf-8")
    with keras.utils.custom_object_scope({"DTypePolicy": keras.mixed_precision.Policy}):
        model = keras.models.model_from_json(cfg)
    model.load_weights(path)
    return model


class DynamicDetector:
    """
    Keeps a rolling 30-frame landmark window and predicts a gesture with your
    Keras sequence model (dynamic_model.h5 + label_map.npy).
    Call predict(frame_bgr) repeatedly; returns (label, conf) only after buffer is filled.
    """

    def __init__(self, weights_path: str, label_map_path: str):
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"dynamic model not found at {weights_path}")
        if not os.path.exists(label_map_path):
            raise FileNotFoundError(f"label map not found at {label_map_path}")

        self.model = load_model_compat(weights_path)
        self.label_map = np.load(label_map_path, allow_pickle=True)
        self.seq: deque = deque(maxlen=SEQUENCE_LENGTH)

        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.5)

    def _landmarks_xyz(self, frame_bgr) -> Optional[List[float]]:
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        if not results.multi_hand_landmarks:
            return None
        hand = results.multi_hand_landmarks[0]
        out = []
        for lm in hand.landmark:
            out.extend([lm.x, lm.y, lm.z])  # 63
        return out

    def predict(self, frame_bgr) -> Tuple[Optional[str], float]:
        lm = self._landmarks_xyz(frame_bgr)
        self.seq.append(lm)

        if len(self.seq) < SEQUENCE_LENGTH:
            return None, 0.0

        valid = sum(1 for v in self.seq if v is not None)
        if valid / SEQUENCE_LENGTH < MIN_VALID_RATIO:
            return None, 0.0

        # Fill None frames with zeros (or you can drop them – but keep shape)
        seq_arr = np.array([v if v is not None else [0.0]*63 for v in self.seq], dtype=np.float32)
        seq_arr = seq_arr.reshape(1, SEQUENCE_LENGTH, 63)

        pred = self.model.predict(seq_arr, verbose=0)[0]
        idx = int(np.argmax(pred))
        conf = float(pred[idx])
        label = str(self.label_map[idx])
        return label, conf
