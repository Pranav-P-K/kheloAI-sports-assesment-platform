from .pose_utils import run_pose_on_video, POSE_LANDMARKS, MP_AVAILABLE, angle
import numpy as np


def analyze_sit_ups(video_path: str):
    """
    Count sit-ups using torso angle cycles.
    - Use angle at HIP between shoulder–hip–knee. When torso goes up, angle decreases.
    - A rep is low(<60 deg) -> high(>100 deg) -> low(<60 deg) cycle.
    """
    frames = run_pose_on_video(video_path, stride=2, min_conf=0.5, max_frames=1200)
    if not MP_AVAILABLE or not frames:
        return None

    LS = POSE_LANDMARKS['LEFT_SHOULDER']
    RS = POSE_LANDMARKS['RIGHT_SHOULDER']
    LH = POSE_LANDMARKS['LEFT_HIP']
    RH = POSE_LANDMARKS['RIGHT_HIP']
    LK = POSE_LANDMARKS['LEFT_KNEE']
    RK = POSE_LANDMARKS['RIGHT_KNEE']

    low_thresh = 60.0
    high_thresh = 100.0

    reps = 0
    state = 'down'  # down = torso close to ground (high angle), expect going up (low angle)
    scores = []

    for f in frames:
        lm = f['landmarks']
        scores.append(f['score'])
        # average left/right hip angles shoulder-hip-knee
        left_ang = angle(lm[LS], lm[LH], lm[LK])
        right_ang = angle(lm[RS], lm[RH], lm[RK])
        torso_ang = (left_ang + right_ang) * 0.5

        if state == 'down' and torso_ang < low_thresh:
            state = 'up'
        elif state == 'up' and torso_ang > high_thresh:
            reps += 1
            state = 'down'

    conf = float(np.clip(np.mean(scores), 0.0, 1.0)) if scores else 0.7

    return {
        'score': int(reps),
        'unit': 'repetitions',
        'attempts': [int(reps)],
        'confidence': round(conf, 2),
        'technique_notes': [
            'Keep feet anchored and avoid pulling the neck',
            'Use a steady pace for consistent counting'
        ],
    }
