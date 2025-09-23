import cv2
import numpy as np

try:
    import mediapipe as mp
    MP_AVAILABLE = True
except Exception:
    mp = None
    MP_AVAILABLE = False

POSE_LANDMARKS = {
    'NOSE': 0,
    'LEFT_EYE_INNER': 1,
    'LEFT_EYE': 2,
    'LEFT_EYE_OUTER': 3,
    'RIGHT_EYE_INNER': 4,
    'RIGHT_EYE': 5,
    'RIGHT_EYE_OUTER': 6,
    'LEFT_EAR': 7,
    'RIGHT_EAR': 8,
    'LEFT_MOUTH': 9,
    'RIGHT_MOUTH': 10,
    'LEFT_SHOULDER': 11,
    'RIGHT_SHOULDER': 12,
    'LEFT_ELBOW': 13,
    'RIGHT_ELBOW': 14,
    'LEFT_WRIST': 15,
    'RIGHT_WRIST': 16,
    'LEFT_PINKY': 17,
    'RIGHT_PINKY': 18,
    'LEFT_INDEX': 19,
    'RIGHT_INDEX': 20,
    'LEFT_THUMB': 21,
    'RIGHT_THUMB': 22,
    'LEFT_HIP': 23,
    'RIGHT_HIP': 24,
    'LEFT_KNEE': 25,
    'RIGHT_KNEE': 26,
    'LEFT_ANKLE': 27,
    'RIGHT_ANKLE': 28,
    'LEFT_HEEL': 29,
    'RIGHT_HEEL': 30,
    'LEFT_FOOT_INDEX': 31,
    'RIGHT_FOOT_INDEX': 32,
}


def angle(a, b, c):
    """Compute angle ABC in degrees for 2D points a, b, c (numpy arrays)."""
    ba = a - b
    bc = c - b
    cosang = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosang = np.clip(cosang, -1.0, 1.0)
    return np.degrees(np.arccos(cosang))


def run_pose_on_video(path, stride=2, min_conf=0.5, max_frames=300):
    """
    Yields pose landmarks per processed frame.
    Returns: list of dict { 'landmarks': np.array([33,2]), 'score': float }
    """
    if not MP_AVAILABLE:
        return []

    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False,
                        min_detection_confidence=min_conf, min_tracking_confidence=min_conf)
    cap = cv2.VideoCapture(path)
    frames = []
    idx = 0
    try:
        while cap.isOpened() and len(frames) < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            if idx % stride != 0:
                idx += 1
                continue
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = pose.process(rgb)
            if res.pose_landmarks:
                lm = res.pose_landmarks.landmark
                h, w = frame.shape[:2]
                pts = np.array([[lm[i].x * w, lm[i].y * h] for i in range(len(lm))], dtype=np.float32)
                score = float(np.mean([l.visibility for l in lm]))
                frames.append({'landmarks': pts, 'score': score, 'size': (w, h)})
            idx += 1
    finally:
        cap.release()
        pose.close()
    return frames
