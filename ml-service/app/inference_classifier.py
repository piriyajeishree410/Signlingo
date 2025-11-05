# ml-service/app/inference_classifier.py
import os
import pickle
from typing import Tuple, Optional

import cv2
import numpy as np
import mediapipe as mp


class InferenceClassifier:
    """
    Predict a single ASL letter from one frame using your scikit-learn model.p
    Expects model_dict with keys: 'model', 'label_map', 'scaler'
    """

    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"model.p not found at {model_path}")

        with open(model_path, "rb") as f:
            model_dict = pickle.load(f)

        self.model = model_dict["model"]
        self.label_map = model_dict["label_map"]  # e.g. {'A':0,'B':1,...}
        self.scaler = model_dict.get("scaler", None)

        # reverse mapping index->label
        self.idx_to_label = {v: k for k, v in self.label_map.items()}

        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def _extract_features(self, frame_bgr) -> Optional[np.ndarray]:
        h, w = frame_bgr.shape[:2]
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        if not results.multi_hand_landmarks:
            return None

        hand = results.multi_hand_landmarks[0]
        xs = [lm.x for lm in hand.landmark]
        ys = [lm.y for lm in hand.landmark]

        feats = []
        # relative coords (42 vals)
        min_x, min_y = min(xs), min(ys)
        for lm in hand.landmark:
            feats.append(lm.x - min_x)
            feats.append(lm.y - min_y)

        # palm direction (2)
        wrist = hand.landmark[0]
        middle_mcp = hand.landmark[9]
        feats.append(middle_mcp.x - wrist.x)
        feats.append(middle_mcp.y - wrist.y)

        # finger distances to palm center (5)
        palm_center = np.array([(min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2])
        for idx in [4, 8, 12, 16, 20]:
            tip = hand.landmark[idx]
            dist = np.linalg.norm(np.array([tip.x, tip.y]) - palm_center)
            feats.append(dist)

        # pinch distance (1)
        thumb_tip = hand.landmark[4]
        index_tip = hand.landmark[8]
        pinch = np.linalg.norm(
            np.array([thumb_tip.x, thumb_tip.y]) - np.array([index_tip.x, index_tip.y])
        )
        feats.append(pinch)

        feats = np.array(feats, dtype=np.float32)
        if self.scaler is not None:
            feats = self.scaler.transform([feats])[0]
        return feats

    def predict(self, frame_bgr) -> Tuple[Optional[str], float]:
        feats = self._extract_features(frame_bgr)
        if feats is None:
            return None, 0.0

        probs = self.model.predict_proba([feats])[0]
        idx = int(np.argmax(probs))
        label = self.idx_to_label.get(idx, None)
        conf = float(probs[idx])
        return label, conf
