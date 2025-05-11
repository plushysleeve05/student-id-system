// src/components/LiveMonitoring.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

function LiveMonitoring() {
  const [isLive, setIsLive] = useState(true);
  const [detectionApproach, setDetectionApproach] = useState("matching");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [eventLog, setEventLog] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveWsConnected, setLiveWsConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const wsLiveRef = useRef(null);
  const bottomRef = useRef(null);
  const canvasRef = useRef(null);
  const frameIntervalRef = useRef(null);

  // ─── Upload‐mode WebSocket (only for /ws) ─────────────────────────────
  useEffect(() => {
    let ws;
    let retryTimer;

    const connect = () => {
      ws = new WebSocket(API_BASE_URL.replace(/^http/, "ws") + "/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Upload WS connected ✅");
        setWsConnected(true);
        ws.send(JSON.stringify({ type: "ready" }));
      };

      ws.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (!data.echo) {
          setEventLog((prev) => [data, ...prev]);
        }
      };

      ws.onerror = (err) => {
        console.warn("Upload WS error, reconnecting…", err);
        ws.close();
      };

      ws.onclose = () => {
        console.log("Upload WS closed ❌ – retrying in 1s");
        setWsConnected(false);
        retryTimer = setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimer);
      ws?.close();
    };
  }, []); // runs only once

  // ─── Live‐mode WebSocket (for /ws/live) ──────────────────────────────
  useEffect(() => {
    if (!isLive || !streaming) return;

    const url =
      API_BASE_URL.replace(/^http/, "ws") +
      `/ws/live?mode=${detectionApproach}`;
    const wsLive = new WebSocket(url);
    wsLive.binaryType = "arraybuffer";
    wsLiveRef.current = wsLive;

    wsLive.onopen = () => {
      console.log("Live WS connected ✅", detectionApproach);
      setLiveWsConnected(true);
    };

    wsLive.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      console.debug("Live frame result:", data);
      setEventLog((prev) => {
        const last = prev[0];
        if (last && last.type === data.type && last.student === data.student) {
          return prev;
        }
        return [data, ...prev];
      });
    };

    wsLive.onerror = (err) => console.error("Live WS error:", err);

    wsLive.onclose = () => {
      console.log("Live WS closed ❌");
      setLiveWsConnected(false);
    };

    return () => {
      wsLive.close();
      wsLiveRef.current = null;
    };
  }, [isLive, streaming, detectionApproach]);

  // ─── Live‐Frame Capture & Send ────────────────────
  useEffect(() => {
    if (isLive && streaming && liveWsConnected) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      frameIntervalRef.current = setInterval(() => {
        if (wsLiveRef.current.readyState !== WebSocket.OPEN) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            blob.arrayBuffer().then((buf) => wsLiveRef.current.send(buf));
          },
          "image/jpeg",
          0.7
        );
      }, 100);
    }
    return () => clearInterval(frameIntervalRef.current);
  }, [isLive, streaming, liveWsConnected]);

  // ─── Scroll to Latest Event ───────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLog]);

  // ─── Update Camera List ───────────────────────────
  useEffect(() => {
    const updateCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    };

    updateCameras();
    navigator.mediaDevices.addEventListener("devicechange", updateCameras);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", updateCameras);
  }, [selectedCamera]);

  // ─── Camera Start and Stop ────────────────────────
  const startCamera = async () => {
    if (!selectedCamera) {
      alert("No camera selected");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedCamera },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      console.log("Camera started successfully");
      setStreaming(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(`Camera Error: ${err.message}`);
      setStreaming(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      console.log("Camera stopped.");
    }
    setStreaming(false);
  };

  // ─── Upload Video Handling ────────────────────────
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
    if (!videoFile || !wsConnected) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("mode", detectionApproach);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      console.log("Upload response:", await res.json());
      setVideoFile(null);
      setPreviewURL(null);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  // ─── Render ───────────────────────────────────────
  return (
    <div className="p-4">
      <canvas ref={canvasRef} style={{ display: "none" }} />

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
              checked={isLive}
              onChange={() => setIsLive(true)}
            />{" "}
            Live Feed
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={!isLive}
              onChange={() => setIsLive(false)}
            />{" "}
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
              value="matching"
              checked={detectionApproach === "matching"}
              onChange={() => setDetectionApproach("matching")}
            />{" "}
            Matching
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              value="ml"
              checked={detectionApproach === "ml"}
              onChange={() => setDetectionApproach("ml")}
            />{" "}
            Machine Learning
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Side */}
        <div className="flex-1">
          {isLive ? (
            // Live Camera View
            <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-900 aspect-video flex flex-col items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mb-4">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="border p-2 rounded bg-gray-800 text-white w-full sm:w-2/3"
                >
                  {cameras.map((cam) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || cam.deviceId}
                    </option>
                  ))}
                </select>
                <button
                  onClick={streaming ? stopCamera : startCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
                >
                  {streaming ? "Stop Stream" : "Start Stream"}
                </button>
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              {streaming && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />{" "}
                  LIVE
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Upload Video Box */}
              <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-900 aspect-video flex flex-col items-center justify-center gap-2">
                {!previewURL ? (
                  <>
                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-600" />
                    <p className="text-sm text-white">Upload Video</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <video
                    src={previewURL}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={handleVideoUpload}
                disabled={!videoFile || !wsConnected || uploading}
                className={`px-4 py-2 rounded text-white ${
                  !videoFile || !wsConnected || uploading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </>
          )}
        </div>

        {/* Right Side - Event Log */}
        <div className="w-1/3 flex flex-col">
          {!wsConnected && eventLog.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Connecting to WebSocket…
              </p>
            </div>
          ) : (
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
                            ? `Recognized ${event.student}`
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
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveMonitoring;
