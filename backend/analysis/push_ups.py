from .pose_utils import run_pose_on_video, POSE_LANDMARKS, MP_AVAILABLE, angle
import numpy as np


def analyze_push_ups(video_path: str):
    """
    Count push-ups using elbow flexion cycles.
    - Compute elbow angles (wrist–elbow–shoulder) for left and right.
    - A rep is counted when avg_elbow_angle transitions: high(>160) -> low(<90) -> high(>160).
    - Confidence from average landmark visibility score.
    """
    frames = run_pose_on_video(video_path, stride=2, min_conf=0.5, max_frames=1200)
    if not MP_AVAILABLE or not frames:
        return None

    LS = POSE_LANDMARKS['LEFT_SHOULDER']
    RS = POSE_LANDMARKS['RIGHT_SHOULDER']
    LE = POSE_LANDMARKS['LEFT_ELBOW']
    RE = POSE_LANDMARKS['RIGHT_ELBOW']
    LW = POSE_LANDMARKS['LEFT_WRIST']
    RW = POSE_LANDMARKS['RIGHT_WRIST']

    down_thresh = 90.0
    up_thresh = 160.0

    reps = 0
    state = 'up'  # expect going down next
    scores = []

    for f in frames:
        lm = f['landmarks']
        scores.append(f['score'])
        # Left angle: wrist-elbow-shoulder
        left_ang = angle(lm[LW], lm[LE], lm[LS])
        right_ang = angle(lm[RW], lm[RE], lm[RS])
        avg_ang = (left_ang + right_ang) * 0.5

        if state == 'up' and avg_ang < down_thresh:
            state = 'down'
        elif state == 'down' and avg_ang > up_thresh:
            reps += 1
            state = 'up'

    conf = float(np.clip(np.mean(scores), 0.0, 1.0)) if scores else 0.7

    return {
        'score': int(reps),
        'unit': 'repetitions',
        'attempts': [int(reps)],
        'confidence': round(conf, 2),
        'technique_notes': [
            'Keep a straight line from head to heels',
            'Lower until elbows reach ~90° for full reps'
        ],
    }
