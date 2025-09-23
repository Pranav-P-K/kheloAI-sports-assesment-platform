import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Helper to construct a file from Expo file URI into FormData
function appendFile(form, field, uri, filename = 'video.mp4', contentType = 'video/mp4') {
  form.append(field, {
    uri,
    name: filename,
    type: contentType,
  });
}

export async function analyzeVideo({ testId, fileUri, signal }) {
  if (!API_BASE_URL) {
    throw new ApiError('API_BASE_URL is not configured');
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}/analyze`;

  const formData = new FormData();
  formData.append('testId', testId);
  appendFile(formData, 'file', fileUri);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      // Let RN set multipart boundary automatically
      // 'Content-Type': 'multipart/form-data'
    },
    signal,
  });

  if (!res.ok) {
    let details = null;
    try { details = await res.json(); } catch {}
    throw new ApiError('Analysis failed', res.status, details);
  }

  const data = await res.json();
  return data;
}

// Analyze with upload progress via Expo FileSystem
// onProgress: (fraction) => void  where fraction in [0,1]
export async function analyzeVideoWithProgress({ testId, fileUri, includeTraces = false, onProgress }) {
  if (!API_BASE_URL) {
    throw new ApiError('API_BASE_URL is not configured');
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}/analyze`;

  const uploadRes = await FileSystem.uploadAsync(url, fileUri, {
    fieldName: 'file',
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    parameters: {
      testId,
      includeTraces: includeTraces ? 'true' : 'false',
    },
    headers: {
      Accept: 'application/json',
    },
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
  });

  if (onProgress) onProgress(1);

  if (uploadRes.status < 200 || uploadRes.status >= 300) {
    let details = null;
    try { details = JSON.parse(uploadRes.body); } catch {}
    throw new ApiError('Analysis failed', uploadRes.status, details);
  }

  const data = JSON.parse(uploadRes.body);
  return { ...data, _source: 'api' };
}
