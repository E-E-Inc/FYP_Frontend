import React, { useRef } from "react";
import Webcam from "react-webcam";
import { saveAs } from "file-saver";

function CameraCapture() {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert the base64 image data to a Blob
      const blob = dataURLtoBlob(imageSrc);
      // Send the screenshot to the server
      uploadBlob(blob);
      // Save the Blob as a file
      // saveAs(blob, 'captured-image.png');
    }
  };

  // Function to convert data URL to Blob
  function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const uploadBlob = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData, 
        // Don't set Content-Type here, let the browser do it
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("File uploaded successfully", jsonResponse);
      } else {
        console.error("Upload failed", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during upload", error);
    }
  };

  return (
    <div>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/png" />
      <button onClick={capture}>Capture Photo</button>
    </div>
  );
}

export default CameraCapture;
