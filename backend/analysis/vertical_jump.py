from .pose_utils import run_pose_on_video, POSE_LANDMARKS, MP_AVAILABLE
import numpy as np


def _pixel_to_cm(scale_pixels: float, limb_pixels: float, default_cm: float = 45.0) -> float:
    """
    Convert pixels to centimeters using a crude calibration: assume the limb length
    (hip->ankle) corresponds to ~45cm (thigh+shin visible length) as a baseline,
    and scale proportionally based on observed pixels.
    """
    if limb_pixels <= 1e-3:
        return scale_pixels  # fallback no scaling
    px_per_cm = limb_pixels / default_cm
    return scale_pixels / px_per_cm


def analyze_vertical_jump(video_path: str):
    """
    Estimate vertical jump height from hip vertical displacement (pixels) converted to cm.
    Steps:
    - Run MediaPipe Pose on video frames (strided)
    - For frames with valid landmarks, compute hip center y = mean(LEFT_HIP, RIGHT_HIP)
    - Compute baseline standing y as median of first 15 frames
    - Peak flight min y as min across frames (smaller y -> higher in image coordinates)
    - Convert pixel delta to cm using hip->ankle limb length as scale
    """
    frames = run_pose_on_video(video_path, stride=2, min_conf=0.5, max_frames=600)
    if not MP_AVAILABLE or not frames:
        return None

    LHIP = POSE_LANDMARKS['LEFT_HIP']
    RHIP = POSE_LANDMARKS['RIGHT_HIP']
    LANK = POSE_LANDMARKS['LEFT_ANKLE']
    RANK = POSE_LANDMARKS['RIGHT_ANKLE']

    hips_y = []
    limb_lengths = []
    scores = []
    trace_frames = []
    for f in frames:
        lm = f['landmarks']
        score = f['score']
        if score < 0.4:
            continue
        hip_y = (lm[LHIP, 1] + lm[RHIP, 1]) * 0.5
        # scale: hip to ankle mean distance (pixels)
        limb = 0.5 * (np.linalg.norm(lm[LHIP] - lm[LANK]) + np.linalg.norm(lm[RHIP] - lm[RANK]))
        if limb <= 1e-3:
            continue
        hips_y.append(hip_y)
        limb_lengths.append(limb)
        scores.append(score)
        trace_frames.append({
            'hip_y': float(hip_y),
            'limb_px': float(limb),
            'score': float(score),
        })

    if len(hips_y) < 8:
        return None

    hips_y = np.array(hips_y)
    limb_lengths = np.array(limb_lengths)
    baseline = float(np.median(hips_y[: min(15, len(hips_y))]))
    peak = float(np.min(hips_y))
    delta_px = max(0.0, baseline - peak)
    scale_px = float(np.median(limb_lengths))
    jump_cm = _pixel_to_cm(delta_px, scale_px, default_cm=45.0)

    conf = float(np.clip(np.mean(scores), 0.0, 1.0))

    return {
        'score': round(jump_cm, 1),
        'unit': 'cm',
        'attempts': [round(jump_cm, 1)],
        'confidence': round(conf, 2),
        'technique_notes': [
            'Keep arms swing coordinated for more lift',
            'Aim for soft, controlled landing'
        ],
        'trace': {
            'series': 'hip_y',
            'frames': trace_frames,
            'baseline_px': baseline,
            'peak_px': peak,
            'delta_px': delta_px,
            'scale_px': scale_px,
            'jump_cm': jump_cm,
        }
    }
