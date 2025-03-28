import React, { useEffect, useRef, useState } from "react";

function CameraSelector() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    // Ask for permission and list available cameras
    navigator.mediaDevices
      .getUserMedia({ video: true }) // request permission
      .then(() => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        // Optionally, auto-select the first camera
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      })
      .catch((err) => {
        console.error("Error accessing cameras:", err);
      });
  }, []);

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };

  const startStream = () => {
    if (!selectedCamera) return;

    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: selectedCamera } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error starting camera stream:", err);
      });
  };

  return (
    <div>
      {/* Dropdown for cameras */}
      <label htmlFor="cameraSelect" className="block mb-2">
        Select a Camera:
      </label>
      <select
        id="cameraSelect"
        value={selectedCamera}
        onChange={handleCameraChange}
        className="p-2 border rounded mb-4"
      >
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `Camera ${camera.deviceId}`}
          </option>
        ))}
      </select>

      {/* Start stream button */}
      <button
        onClick={startStream}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Stream
      </button>

      {/* Video preview */}
      <div className="mt-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md bg-black rounded"
        />
      </div>
    </div>
  );
}

export default CameraSelector;
