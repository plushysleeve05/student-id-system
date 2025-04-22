// src/components/LiveMonitoring.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

function LiveMonitoring() {
  // ─── State variables ─────────────────────────────────────────────────────────
  // true = use live camera; false = use uploaded video
  const [isLive, setIsLive] = useState(true);
  // which detection approach: "matching" or "ml"
  const [detectionApproach, setDetectionApproach] = useState("matching");
  // list of camera devices
  const [cameras, setCameras] = useState([]);
  // currently selected camera ID
  const [selectedCamera, setSelectedCamera] = useState("");
  // ref to the <video> element for live stream
  const videoRef = useRef(null);
  // MediaStream object when live streaming
  const [stream, setStream] = useState(null);
  // chosen file for upload
  const [videoFile, setVideoFile] = useState(null);
  // URL for previewing the uploaded file
  const [previewURL, setPreviewURL] = useState(null);
  // is the upload in progress?
  const [uploading, setUploading] = useState(false);
  // incoming face‑match events
  const [eventLog, setEventLog] = useState([]);
  // WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false);

  // ─── WebSocket setup ─────────────────────────────────────────────────────────
  // Connect once on mount, receive real‑time events
  useEffect(() => {
    const ws = new WebSocket(API_BASE_URL.replace(/^http/, "ws") + "/ws");

    ws.onopen = () => {
      console.log("WebSocket connected ✅");
      setWsConnected(true); // mark as connected
      ws.send(JSON.stringify({ type: "ready" })); // handshake
    };

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.echo) return; // ignore echo
      setEventLog((prev) => [data, ...prev]); // prepend new event
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onclose = () => {
      console.log("WebSocket closed");
      setWsConnected(false);
    };

    // cleanup on unmount
    return () => ws.close();
  }, []);

  // ─── Camera stream cleanup ───────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // ─── Enumerate cameras when live mode toggles ─────────────────────────────────
  useEffect(() => {
    if (isLive) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => navigator.mediaDevices.enumerateDevices())
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          setCameras(videoDevices);
          if (videoDevices[0]) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        })
        .catch((err) => console.error("Error enumerating cameras:", err));
    } else {
      // when switching to upload mode, stop any live stream
      setCameras([]);
      setSelectedCamera("");
      stopStream();
    }
    return () => stopStream();
  }, [isLive, stopStream]);

  // ─── Start the selected camera ───────────────────────────────────────────────
  const startCameraStream = () => {
    if (!selectedCamera) return;
    stopStream();
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: selectedCamera } })
      .then((newStream) => {
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
      })
      .catch((err) => console.error("Error starting camera stream:", err));
  };

  // ─── Handle user selecting a video file ───────────────────────────────────────
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setPreviewURL(URL.createObjectURL(file)); // blob URL for preview
    } else {
      alert("Please select a valid video file");
    }
  };

  // ─── Upload the selected video for processing ────────────────────────────────
  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", videoFile); // matches FastAPI param
    formData.append("mode", detectionApproach); // add detection mode (matching or ml)
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload response:", data);
      setVideoFile(null);
      setPreviewURL(null);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-blue-600" />
          Live Monitoring
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time access events
        </p>
      </div>

      {/* Video Mode Toggle */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Video Mode
        </h3>
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

      {/* Detection Approach Toggle */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
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
        {/* Left panel: live feed or video upload */}
        <div className="flex-1">
          {isLive ? (
            <div className="space-y-4 dark:bg-gray-800 rounded-lg p-4">
              {/* Camera selection */}
              {cameras.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

              {/* Live video preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
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
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    LIVE
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Video upload preview */}
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
                  <video controls loop className="w-full h-full object-cover">
                    <source src={previewURL} type={videoFile.type} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Upload button */}
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

        {/* Right panel: scrollable event log */}
        <div className="w-1/3 flex flex-col">
          {/* Show spinner until WS connects & first event arrives */}
          {!wsConnected && eventLog.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Connecting to events…
              </p>
            </div>
          ) : (
            <>
              {/* Scrollable container for events */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2">
                {eventLog.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                    No events yet
                  </p>
                ) : (
                  eventLog.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          event.type === "success"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-yellow-100 dark:bg-yellow-900/20"
                        }`}
                      >
                        {event.type === "success" ? (
                          <UserIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate dark:text-white">
                            {event.type === "success"
                              ? `Recognized ${event.name}`
                              : `Unrecognized at ${event.location}`}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.location}
                        </p>
                      </div>
                      {event.type === "success" ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
              {/* “View All Events” link */}
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 self-start">
                View All Events →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveMonitoring;
