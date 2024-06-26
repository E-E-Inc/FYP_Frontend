import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import Modal from "react-modal";
import "./pages.css";
import BackButton from "./backButton";
import { BiArrowBack } from "react-icons/bi";
import FadeLoader from "react-spinners/FadeLoader";
import { Grid } from "@mui/material";

Modal.setAppElement("#root"); // This line is needed for accessibility reasons

function CameraCapture() {
  const webcamRef = useRef(null);

  // Handles state
  const [pictureCaptured, setPictureCaptured] = useState(false);
  const [portionSize, setPortionSize] = useState(1);
  const [manualModalIsOpen, setManualModalIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [resultModalIsOpen, setResultModalIsOpen] = useState(false);
  const [CalsmodalIsOpen, setCalsModalIsOpen] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [Calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [foodName, setFoodName] = useState(null);
  const [portion, setPortion] = useState(null);
  const [webcamReady, setWebcamReady] = useState(false);

  const [noInfoError, setNoInfoError] = useState(false);
  const [foodNameError, setFoodNameError] = useState(false);
  const [portionError, setPortionError] = useState(false);
  const [noFoodFound, setNoFoodFound] = useState(false);
  useEffect(() => {
    console.log("File path is:", filePath);
    setNoFoodFound(false);
  }, [filePath]);

  // Method to deal with captured image
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const blob = dataURLtoBlob(imageSrc);
      uploadBlob(blob);

      // Sets that a picture is captured and opens the Modal
      setPictureCaptured(true);
    }
  };

  // Convert URL to a blob
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
  // Method for sending a post request to /image_process to process the photo taken by the user
  const sendPortionSize = () => {
    setLoading(true);
    axios
      .post(
        "http://localhost:5000/image_process",
        {
          portionSize: portionSize,
          Calories: Calories,
          filePath: filePath,
          foodData: foodData,
        },
        { withCredentials: true }
      )
      .then(function (response) {
        console.log(response);

        // Check if response.data is defined
        if (response.data) {
          // Sets the food data and overall calories
          setFoodData(response.data.result);
          setCalories(response.data.calories);

          //reset picture captured to false
          setPictureCaptured(false);

          console.log(Calories);
          //Close User input for calories modal
          closeModal();
          // If no food data is returned, open the manual food entry modal
          if (!response.data.result) {
            openManualModal();
          } else {
            CalsopenModal();
          }
        } else {
          console.log("No data in response");
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Validation logic
  const validateFields = () => {
    let isValid = true;

    // Validate food name
    if (!foodName) {
      setFoodNameError(true);
      isValid = false;
    } else {
      setFoodNameError(false);
    }

    // Validate portion
    if (!portion || isNaN(portion) || portion <= 0) {
      setPortionError(true);
      isValid = false;
    } else {
      setPortionError(false);
    }

    // Validate portion
    if (!portion || !foodName) {
      setNoInfoError(true);
      isValid = false;
    } else {
      setNoInfoError(false);
    }

    return isValid;
  };

  // Method for sending a post request to /image_process_manually to process the food inputted by the user
  const sendFoodInfo = () => {
    setNoInfoError(false);
    setFoodNameError(false);
    setPortionError(false);

    // // Validate fields
    // if (!validateFields()) {
    //   return;
    // }

    setLoading(true);
    axios
      .post(
        "http://localhost:5000/image_process_manually",
        {
          portion: portion,
          Calories: Calories,
          foodName: foodName,
        },
        { withCredentials: true }
      )
      .then(function (response) {
        console.log(response);
        // If food data is found
        if (response.data && response.data.result) {
          // Sets the food data and overall calories
          setFoodData(response.data.result);
          setCalories(response.data.calories);

          closeManualModal();
          CalsopenModal();
        } else {
          // If no food data is found
          setCalsModalIsOpen(false);
          console.log("No data in response");
          setNoFoodFound(true);
          console.log("Food Found: ", noFoodFound);
          openNoResultModal();
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Method for closing modal
  const goback = () => {
    CalscloseModal();
    setFoodName(" ");
    setPortion(" ");
    setNoFoodFound(true);

    console.log("Reset Food found ", noFoodFound);
  };

  // Method for sending a post request to /image_upload to upload the photo taken by the user
  const uploadBlob = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);

    try {
      const response = await fetch("http://localhost:5000/image_upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("File uploaded successfully", jsonResponse);
        setFilePath(jsonResponse.file_path);
        setPictureCaptured(true);
        openModal();
      } else {
        console.error("Upload failed", response.status, response.statusText);
        openManualModal();
      }
    } catch (error) {
      console.error("Error during upload", error);
    }
  };

  // Method for opening modal for user input
  const openManualModal = () => {
    setManualModalIsOpen(true);
  };

  // Method for closing modal for user input
  const closeManualModal = () => {
    setManualModalIsOpen(false);
  };

  // Method for opening modal for user input
  const openModal = () => {
    setModalIsOpen(true);
  };

  // Method for closing modal for user input
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Method for opening modal for user input
  const openNoResultModal = () => {
    setResultModalIsOpen(true);
  };

  // Method for closing modal for user input
  const closeNoResultModal = () => {
    setResultModalIsOpen(false);
  };

  // Method for opening modal for displaying calories
  const CalsopenModal = () => {
    setCalsModalIsOpen(true);
  };

  // Method for closing modal for displaying calories
  const CalscloseModal = () => {
    setCalsModalIsOpen(false);
  };

  return (
    <div className="camera-capture-div">
      <BackButton />
      <h1
        style={{
          display: "flex",
          justifyContent: "left",
          width: "89%",
          color: "burlywood",
        }}
      >
        Whats on your plate?
      </h1>
      <div style={{ display: "flex", justifyContent: "right", width: "90%" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          className="webcam"
          onUserMedia={() => setWebcamReady(true)}
        />
      </div>

      {/* Display Calories Model */}
      {foodData && (
        <Modal
          isOpen={CalsmodalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Portion Size Input"
          style={{
            overlay: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            content: {
              position: "relative",
              top: "auto",
              left: "auto",
              right: "auto",
              bottom: "auto",
              borderRadius: "10px",
            },
          }}
        >
          <button onClick={goback} className="back-button-model">
            <BiArrowBack />
          </button>
          <h1 className="my-heading"> Nutritional Information</h1>
          <h2>Food Name: {foodData}</h2>
          <h2>Overall Calories: {Calories}</h2>
        </Modal>
      )}

      <div style={{ display: "flex", justifyContent: "left", width: "45%" }}>
        <button onClick={capture} className="capture-button">
          Capture Photo
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "left", width: "45%" }}>
        <button onClick={openManualModal} className="capture-button">
          Search for Food
        </button>
      </div>

      {/* Portion size Model */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Portion Size Input"
        style={{
          overlay: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            position: "relative",
            top: "auto",
            left: "auto",
            right: "auto",
            bottom: "auto",
            borderRadius: "10px",
          },
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <FadeLoader />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2>Enter Portion Size</h2>
            <input
              type="number"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
              placeholder="Enter portion size"
              className="portion-size-input"
              style={{ marginBottom: "10px" }}
            />
            <button
              onClick={sendPortionSize}
              className="send-button"
              style={{ display: loading ? "none" : "block" }}
            >
              Send Portion Size
            </button>
          </div>
        )}
      </Modal>

      {/* Model for manual food entry */}
      <Modal
        isOpen={manualModalIsOpen}
        onRequestClose={closeManualModal}
        contentLabel="Manual Input"
        style={{
          overlay: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            position: "relative",
            top: "auto",
            left: "auto",
            right: "auto",
            bottom: "auto",
            borderRadius: "10px",
          },
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <FadeLoader />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2>Enter food name</h2>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Enter Food name"
              className="food-input"
              style={{ marginBottom: "10px" }}
            />
            <Grid item xs={12}>
              {foodNameError && (
                <label className="error-label">Please enter a Food</label>
              )}
            </Grid>

            <h2>Enter Portion Size</h2>
            <input
              type="number"
              value={portion}
              onChange={(e) => setPortion(e.target.value)}
              placeholder="Enter portion size"
              className="food-input"
              style={{ marginBottom: "10px" }}
            />
            <Grid item xs={12}>
              {portionError && (
                <label className="error-label">
                  Please enter a valid portion size
                </label>
              )}
            </Grid>
            <button
              onClick={sendFoodInfo}
              className="send-button"
              style={{ display: loading ? "none" : "block" }}
            >
              Add Food
            </button>
            {noFoodFound && (
              <label className="error-label">
                No food found! Please try again{" "}
              </label>
            )}
            <Grid item xs={12}>
              {noInfoError && (
                <label className="error-label">
                  Please enter both a Food name and portion size
                </label>
              )}
            </Grid>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CameraCapture;
