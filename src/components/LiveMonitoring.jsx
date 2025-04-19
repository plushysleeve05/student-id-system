import React, { useState, useEffect, useRef } from "react";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

function LiveMonitoring() {
  const [isLive, setIsLive] = useState(true);
  const [detectionApproach, setDetectionApproach] = useState("matching");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://34.72.198.201:8000/ws");
    ws.onopen = () => {
      console.log("WebSocket connected ✅");
      ws.send("Hello from frontend");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEventLog((prev) => [data, ...prev]);
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    return () => ws.close();
  }, []);

  const stopStream = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isLive) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => navigator.mediaDevices.enumerateDevices())
        .then((devices) => {
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        })
        .catch((err) => console.error("Error enumerating cameras:", err));
    } else {
      setCameras([]);
      setSelectedCamera("");
      stopStream();
    }
    return () => stopStream();
  }, [isLive, stopStream]);

  const startCameraStream = () => {
    if (!selectedCamera) return;
    stopStream();
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: selectedCamera } })
      .then((newStream) => {
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      })
      .catch((err) => console.error("Error starting camera stream:", err));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setPreviewURL(URL.createObjectURL(file));
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Upload response:", result);
      // ✅ Reset state to allow re-upload
      setVideoFile(null);
      setPreviewURL(null);
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-blue-600" />
          Live Monitoring
        </h2>
        <p className="text-sm text-gray-600">Real-time access events</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800">Video Mode</h3>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="videoMode"
              value="live"
              checked={isLive}
              onChange={() => setIsLive(true)}
            />
            Live Feed
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="videoMode"
              value="upload"
              checked={!isLive}
              onChange={() => setIsLive(false)}
            />
            Upload Video
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800">
          Detection Approach
        </h3>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="detectionApproach"
              value="matching"
              checked={detectionApproach === "matching"}
              onChange={() => setDetectionApproach("matching")}
            />
            Matching
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="detectionApproach"
              value="ml"
              checked={detectionApproach === "ml"}
              onChange={() => setDetectionApproach("ml")}
            />
            Machine Learning
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {isLive ? (
            <div className="space-y-4 dark:bg-gray-800 rounded-lg p-4">
              {cameras.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Camera:
                  </label>
                  <select
                    className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                  >
                    {cameras.map((cam) => (
                      <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Camera ${cam.deviceId}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={startCameraStream}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Start Stream
                  </button>
                </div>
              )}
              <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CameraIcon className="w-12 h-12 text-gray-600" />
                    <p className="text-sm text-white ml-2">No Camera Stream</p>
                  </div>
                )}
                {stream && (
                  <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 rounded text-xs text-white flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    LIVE
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-900 aspect-video flex flex-col items-center justify-center gap-2">
                {!previewURL ? (
                  <>
                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-600" />
                    <p className="text-sm text-white">Upload Video</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <video controls className="w-full h-full object-cover">
                    <source src={previewURL} type={videoFile.type} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              {uploading ? (
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                  disabled
                >
                  Uploading...
                </button>
              ) : (
                <button
                  onClick={handleVideoUpload}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={!videoFile}
                >
                  Upload Video
                </button>
              )}
            </>
          )}
        </div>

        <div className="w-1/3">
          <div className="space-y-4">
            {eventLog.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg"
              >
                <div
                  className={`p-2 rounded-full ${
                    event.type === "success" ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  {event.type === "success" ? (
                    <UserIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{event.name}</p>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </div>
                  <p className="text-xs text-gray-600">{event.location}</p>
                </div>
                {event.type === "success" ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-700">
            View All Events →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveMonitoring;
