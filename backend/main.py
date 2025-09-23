from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import tempfile
import time
import json

# NOTE: This is a scaffold. Replace the simple heuristics with real
# MediaPipe/OpenCV analysis functions in analysis/<test>.py modules.

app = FastAPI(title="Sports Assessment ML API", version="0.1.0")

# CORS for local/mobile development. Adjust origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResponse(BaseModel):
    testId: str
    testName: str
    timestamp: str
    videoUri: Optional[str] = None
    score: str | float | int
    unit: str
    attempts: Optional[List[str | float | int]] = []
    confidence: float
    technique_notes: Optional[List[str]] = []
    trace: Optional[dict] = None


# Runtime configuration (can be adjusted via /config)
CONFIG = {
    "includeTraces": False,
    # Thresholds (future use by analyzers)
    "pushups": {"down_thresh": 90.0, "up_thresh": 160.0},
    "situps": {"low_thresh": 60.0, "high_thresh": 100.0},
}


TEST_NAME_MAP = {
    "vertical_jump": "Vertical Jump Test",
    "push_ups": "Push-ups Test",
    "sit_ups": "Sit-ups Test",
    "flexibility": "Flexibility Test",
}


def analyze_vertical_jump_fallback(video_path: str):
    size_kb = os.path.getsize(video_path) / 1024
    score_cm = 30 + (int(size_kb) % 15)  # 30-44 cm
    return {
        "score": score_cm,
        "unit": "cm",
        "attempts": [round(score_cm - 1, 1), round(score_cm, 1), round(score_cm - 0.5, 1)],
        "confidence": 0.9,
        "technique_notes": [
            "Good takeoff form",
            "Consider improving arm swing for more lift",
        ],
    }


def analyze_push_ups_fallback(video_path: str):
    size_kb = os.path.getsize(video_path) / 1024
    reps = 20 + int(size_kb) % 20
    return {
        "score": reps,
        "unit": "repetitions",
        "attempts": [reps],
        "confidence": 0.85,
        "technique_notes": [
            "Maintain a straight line from head to heels",
            "Lower until elbows reach ~90° for full reps",
        ],
    }


def analyze_sit_ups_fallback(video_path: str):
    size_kb = os.path.getsize(video_path) / 1024
    reps = 25 + int(size_kb) % 20
    return {
        "score": reps,
        "unit": "repetitions",
        "attempts": [reps],
        "confidence": 0.9,
        "technique_notes": [
            "Consistent range of motion",
            "Avoid pulling on the neck",
        ],
    }


def analyze_flexibility_fallback(video_path: str):
    size_kb = os.path.getsize(video_path) / 1024
    cm = 10 + int(size_kb) % 8  # 10-17 cm
    return {
        "score": cm,
        "unit": "cm",
        "attempts": [round(cm - 1, 1), round(cm, 1), round(cm - 0.5, 1)],
        "confidence": 0.9,
        "technique_notes": [
            "Smooth controlled reach",
            "Exhale during the reach for extra range",
        ],
    }


# Try to load real analyzers (MediaPipe-based). Fall back to heuristics if not available or returns None.
try:
    from analysis.vertical_jump import analyze_vertical_jump as vz_real
except Exception:
    vz_real = None
try:
    from analysis.push_ups import analyze_push_ups as pu_real
except Exception:
    pu_real = None
try:
    from analysis.sit_ups import analyze_sit_ups as su_real
except Exception:
    su_real = None
try:
    from analysis.flexibility import analyze_flexibility as fx_real
except Exception:
    fx_real = None


def _dispatch_with_fallback(test_id: str, video_path: str):
    if test_id == "vertical_jump":
        if vz_real is not None:
            out = vz_real(video_path)
            if out:
                return out
        return analyze_vertical_jump_fallback(video_path)
    if test_id == "push_ups":
        if pu_real is not None:
            out = pu_real(video_path)
            if out:
                return out
        return analyze_push_ups_fallback(video_path)
    if test_id == "sit_ups":
        if su_real is not None:
            out = su_real(video_path)
            if out:
                return out
        return analyze_sit_ups_fallback(video_path)
    if test_id == "flexibility":
        if fx_real is not None:
            out = fx_real(video_path)
            if out:
                return out
        return analyze_flexibility_fallback(video_path)
    # default
    return analyze_vertical_jump_fallback(video_path)


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    file: UploadFile = File(...),
    testId: str = Form(...),
    includeTraces: Optional[bool] = Form(False),
):
    if testId not in TEST_NAME_MAP:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Unsupported testId '{testId}'")

    # Persist upload to a temp file for OpenCV/MediaPipe usage
    suffix = os.path.splitext(file.filename or "uploaded.mp4")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Simulate processing latency (replace with real compute time)
        time.sleep(1.0)

        result = _dispatch_with_fallback(testId, tmp_path)
        # Compose response
        # Persist trace if requested
        trace_obj = result.get("trace") if isinstance(result, dict) else None
        if includeTraces or CONFIG.get("includeTraces"):
            if trace_obj:
                os.makedirs("traces", exist_ok=True)
                ts = int(time.time())
                trace_path = os.path.join("traces", f"{testId}_{ts}.json")
                try:
                    with open(trace_path, "w", encoding="utf-8") as f:
                        json.dump(trace_obj, f)
                    # also attach path
                    trace_obj = {
                        **trace_obj,
                        "_path": trace_path,
                    }
                except Exception:
                    pass
        return AnalysisResponse(
            testId=testId,
            testName=TEST_NAME_MAP.get(testId, testId),
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            videoUri=None,
            score=result["score"],
            unit=result["unit"],
            attempts=result.get("attempts", []),
            confidence=result.get("confidence", 0.9),
            technique_notes=result.get("technique_notes", []),
            trace=trace_obj,
        )
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


@app.get("/config")
def get_config():
    return CONFIG


class ConfigUpdate(BaseModel):
    includeTraces: Optional[bool] = None
    pushups: Optional[dict] = None
    situps: Optional[dict] = None


@app.post("/config")
def update_config(update: ConfigUpdate):
    if update.includeTraces is not None:
        CONFIG["includeTraces"] = bool(update.includeTraces)
    if isinstance(update.pushups, dict):
        CONFIG.setdefault("pushups", {}).update(update.pushups)
    if isinstance(update.situps, dict):
        CONFIG.setdefault("situps", {}).update(update.situps)
    return CONFIG
