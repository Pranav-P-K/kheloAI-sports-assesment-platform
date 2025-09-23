from .pose_utils import run_pose_on_video, POSE_LANDMARKS, MP_AVAILABLE
import numpy as np


def analyze_flexibility(video_path: str):
    """
    Estimate sit-and-reach style flexibility:
    - Estimate reach distance along the horizontal axis from hip towards feet using hand-to-ankle proximity.
    - Use hip as origin and project wrist toward ankle direction to measure furthest reach in pixels.
    - Convert pixels to cm using hip->ankle limb length as scale (coarse heuristic).
    """
    frames = run_pose_on_video(video_path, stride=2, min_conf=0.5, max_frames=900)
    if not MP_AVAILABLE or not frames:
        return None

    LH = POSE_LANDMARKS['LEFT_HIP']
    RH = POSE_LANDMARKS['RIGHT_HIP']
    LW = POSE_LANDMARKS['LEFT_WRIST']
    RW = POSE_LANDMARKS['RIGHT_WRIST']
    LA = POSE_LANDMARKS['LEFT_ANKLE']
    RA = POSE_LANDMARKS['RIGHT_ANKLE']

    max_reach_px = 0.0
    limb_scales = []
    scores = []

    for f in frames:
        lm = f['landmarks']
        scores.append(f['score'])
        hip = 0.5 * (lm[LH] + lm[RH])
        wrist = 0.5 * (lm[LW] + lm[RW])
        ankle = 0.5 * (lm[LA] + lm[RA])

        # Vector from hip to ankle to define forward direction
        v_ref = ankle - hip
        if np.linalg.norm(v_ref) < 1e-3:
            continue
        v_ref_unit = v_ref / (np.linalg.norm(v_ref) + 1e-6)
        # Project wrist onto hip->ankle direction
        reach_vec = wrist - hip
        reach_along = float(np.dot(reach_vec, v_ref_unit))  # pixels along direction
        if reach_along > max_reach_px:
            max_reach_px = reach_along

        limb = np.linalg.norm(ankle - hip)
        if limb > 1e-3:
            limb_scales.append(limb)

    if max_reach_px <= 0 or not limb_scales:
        return None

    px_per_cm = np.median(limb_scales) / 45.0  # assume hip->ankle ~45cm visible length
    cm = max_reach_px / (px_per_cm + 1e-6)

    conf = float(np.clip(np.mean(scores), 0.0, 1.0)) if scores else 0.8

    return {
        'score': round(cm, 1),
        'unit': 'cm',
        'attempts': [round(cm, 1)],
        'confidence': round(conf, 2),
        'technique_notes': [
            'Reach smoothly and hold for 2 seconds',
            'Exhale during the reach for extra range'
        ],
    }
