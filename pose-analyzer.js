import { Chart } from "@/components/ui/chart"
// Pose Analyzer - TensorFlow.js Implementation
document.addEventListener("DOMContentLoaded", () => {
  // Import necessary TensorFlow.js libraries
  // Pose Detection is used for pose estimation
  const poseDetection = window.poseDetection

  // DOM Elements
  const video = document.getElementById("video")
  const canvas = document.getElementById("output-canvas")
  const ctx = canvas.getContext("2d")
  const keypointsCanvas = document.getElementById("keypoints-canvas")
  const keypointsCtx = keypointsCanvas.getContext("2d")
  const loadingIndicator = document.getElementById("loading-indicator")
  const noWebcamMessage = document.getElementById("no-webcam-message")
  const tryAgainBtn = document.getElementById("try-again-btn")
  const cameraBtn = document.getElementById("camera-btn")
  const uploadBtn = document.getElementById("upload-btn")
  const urlBtn = document.getElementById("url-btn")
  const snapshotBtn = document.getElementById("snapshot-btn")
  const recordBtn = document.getElementById("record-btn")
  const modelSelect = document.getElementById("model-select")
  const confidenceThreshold = document.getElementById("confidence-threshold")
  const confidenceValue = document.getElementById("confidence-value")
  const detectionSpeed = document.getElementById("detection-speed")
  const speedValue = document.getElementById("speed-value")
  const fullscreenBtn = document.getElementById("fullscreen-btn")
  const settingsBtn = document.getElementById("settings-btn")
  const helpBtn = document.getElementById("help-btn")
  const exportBtn = document.getElementById("export-btn")
  const clearBtn = document.getElementById("clear-btn")
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabPanes = document.querySelectorAll(".tab-pane")
  const poseConfidence = document.getElementById("pose-confidence")
  const peopleCount = document.getElementById("people-count")
  const fpsCounter = document.getElementById("fps-counter")
  const keypointsList = document.getElementById("keypoints-list")
  const postureMetrics = document.getElementById("posture-metrics")
  const avgConfidence = document.getElementById("avg-confidence")
  const movementIntensity = document.getElementById("movement-intensity")
  const postureScore = document.getElementById("posture-score")
  const exerciseCards = document.querySelectorAll(".exercise-card")
  const exerciseTracker = document.getElementById("exercise-tracker")
  const exerciseName = document.getElementById("exercise-name")
  const stopExerciseBtn = document.getElementById("stop-exercise")
  const repCount = document.getElementById("rep-count")
  const formQuality = document.getElementById("form-quality")
  const caloriesBurned = document.getElementById("calories-burned")
  const exerciseTime = document.getElementById("exercise-time")
  const feedbackList = document.getElementById("feedback-list")
  const progressCircle = document.getElementById("progress-circle")
  const captureNewBtn = document.getElementById("capture-new")
  const snapshotsGrid = document.getElementById("snapshots-grid")
  const helpModal = document.getElementById("help-modal")
  const settingsModal = document.getElementById("settings-modal")
  const uploadModal = document.getElementById("upload-modal")
  const urlModal = document.getElementById("url-modal")
  const closeModalBtns = document.querySelectorAll(".close-modal")
  const uploadDropzone = document.getElementById("upload-dropzone")
  const videoUpload = document.getElementById("video-upload")
  const uploadPreview = document.getElementById("upload-preview")
  const previewVideo = document.getElementById("preview-video")
  const fileName = document.getElementById("file-name")
  const fileSize = document.getElementById("file-size")
  const processUploadBtn = document.getElementById("process-upload")
  const videoUrl = document.getElementById("video-url")
  const urlPreview = document.getElementById("url-preview")
  const urlPreviewVideo = document.getElementById("url-preview-video")
  const processUrlBtn = document.getElementById("process-url")
  const showSkeleton = document.getElementById("show-skeleton")
  const showKeypoints = document.getElementById("show-keypoints")
  const showLabels = document.getElementById("show-labels")
  const mirrorView = document.getElementById("mirror-view")
  const maxPoses = document.getElementById("max-poses")
  const skeletonColor = document.getElementById("skeleton-color")
  const keypointColor = document.getElementById("keypoint-color")
  const cameraResolution = document.getElementById("camera-resolution")
  const saveSettingsBtn = document.getElementById("save-settings")

  // State variables
  let model = null
  let modelType = "movenet"
  let detector = null
  let isModelLoaded = false
  let isWebcamRunning = false
  let videoSource = "camera"
  let lastPoseData = null
  let poseHistory = []
  let currentExercise = null
  let exerciseStartTime = null
  let repCounter = 0
  let isInUpperPosition = false
  let isRecording = false
  let recordingStartTime = null
  let recordedFrames = []
  let snapshots = []
  let confidenceThresholdValue = 0.5
  let detectionSpeedValue = 3
  let frameCount = 0
  let lastFpsUpdateTime = 0
  let fps = 0
  let animationFrameId = null

  // Settings
  let settings = {
    showSkeleton: true,
    showKeypoints: true,
    showLabels: false,
    mirrorView: true,
    maxPoses: 1,
    skeletonColor: "#4a6cf7",
    keypointColor: "#ff4757",
    resolution: "640x480",
  }

  // Constants
  const KEYPOINT_NAMES = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
  ]

  const CONNECTED_KEYPOINTS = [
    ["left_wrist", "left_elbow"],
    ["left_elbow", "left_shoulder"],
    ["right_wrist", "right_elbow"],
    ["right_elbow", "right_shoulder"],
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
    ["nose", "left_eye"],
    ["left_eye", "left_ear"],
    ["nose", "right_eye"],
    ["right_eye", "right_ear"],
  ]

  const EXERCISE_DEFINITIONS = {
    squat: {
      keypoints: ["left_hip", "left_knee", "left_ankle"],
      startAngle: 170,
      endAngle: 90,
      feedback: {
        kneeOverToes: "Keep your knees behind your toes",
        backStraight: "Keep your back straight",
        feetWidth: "Keep your feet shoulder-width apart",
      },
    },
    pushup: {
      keypoints: ["left_shoulder", "left_elbow", "left_wrist"],
      startAngle: 160,
      endAngle: 90,
      feedback: {
        bodyAlignment: "Keep your body in a straight line",
        elbowAngle: "Lower until elbows are at 90 degrees",
        headPosition: "Keep your head in line with your spine",
      },
    },
    lunge: {
      keypoints: ["left_hip", "left_knee", "left_ankle"],
      startAngle: 170,
      endAngle: 110,
      feedback: {
        kneeAlignment: "Front knee should be aligned with ankle",
        torsoUpright: "Keep your torso upright",
        stepLength: "Take a big enough step forward",
      },
    },
    plank: {
      keypoints: ["left_shoulder", "left_hip", "left_ankle"],
      targetAngle: 180,
      tolerance: 15,
      feedback: {
        bodyLine: "Maintain a straight line from head to heels",
        hipPosition: "Don't let your hips sag or pike up",
        shoulderPosition: "Keep shoulders over elbows",
      },
    },
    "jumping-jack": {
      keypoints: ["left_shoulder", "left_hip", "left_ankle"],
      startAngle: 10,
      endAngle: 45,
      feedback: {
        armExtension: "Extend your arms fully overhead",
        jumpWidth: "Jump wide enough with your feet",
        timing: "Coordinate arms and legs together",
      },
    },
  }

  // Initialize charts
  let stabilityChart = null
  let movementChart = null

  // Initialize the application
  async function init() {
    setupEventListeners()
    setupCharts()
    await loadModel()
    setupCamera()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Tab navigation
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab
        tabBtns.forEach((b) => b.classList.remove("active"))
        tabPanes.forEach((p) => p.classList.remove("active"))
        btn.classList.add("active")
        document.getElementById(tabId).classList.add("active")
      })
    })

    // Video source buttons
    cameraBtn.addEventListener("click", () => switchVideoSource("camera"))
    uploadBtn.addEventListener("click", () => openModal(uploadModal))
    urlBtn.addEventListener("click", () => openModal(urlModal))
    snapshotBtn.addEventListener("click", captureSnapshot)
    recordBtn.addEventListener("click", toggleRecording)

    // Model controls
    modelSelect.addEventListener("change", changeModel)
    confidenceThreshold.addEventListener("input", updateConfidenceThreshold)
    detectionSpeed.addEventListener("input", updateDetectionSpeed)

    // Panel controls
    fullscreenBtn.addEventListener("click", toggleFullscreen)
    settingsBtn.addEventListener("click", () => openModal(settingsModal))
    helpBtn.addEventListener("click", () => openModal(helpModal))
    exportBtn.addEventListener("click", exportResults)
    clearBtn.addEventListener("click", clearResults)

    // Exercise cards
    exerciseCards.forEach((card) => {
      card.addEventListener("click", () => startExercise(card.dataset.exercise))
    })
    stopExerciseBtn.addEventListener("click", stopExercise)

    // Snapshot controls
    captureNewBtn.addEventListener("click", captureSnapshot)

    // Modal controls
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal")
        closeModal(modal)
      })
    })

    // Upload controls
    uploadDropzone.addEventListener("click", () => videoUpload.click())
    uploadDropzone.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadDropzone.classList.add("dragover")
    })
    uploadDropzone.addEventListener("dragleave", () => {
      uploadDropzone.classList.remove("dragover")
    })
    uploadDropzone.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadDropzone.classList.remove("dragover")
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0])
      }
    })
    videoUpload.addEventListener("change", () => {
      if (videoUpload.files.length) {
        handleFileUpload(videoUpload.files[0])
      }
    })
    processUploadBtn.addEventListener("click", () => {
      closeModal(uploadModal)
      switchVideoSource("upload")
    })

    // URL controls
    processUrlBtn.addEventListener("click", () => {
      const url = videoUrl.value.trim()
      if (url) {
        urlPreviewVideo.src = url
        urlPreview.classList.remove("hidden")
        urlPreviewVideo.addEventListener("loadedmetadata", () => {
          closeModal(urlModal)
          switchVideoSource("url")
        })
        urlPreviewVideo.addEventListener("error", () => {
          alert("Could not load video from URL. Please check the URL and try again.")
        })
      }
    })

    // Settings controls
    saveSettingsBtn.addEventListener("click", saveSettings)

    // Try again button for webcam
    tryAgainBtn.addEventListener("click", setupCamera)
  }

  // Set up Chart.js charts
  function setupCharts() {
    const stabilityCtx = document.getElementById("stability-chart").getContext("2d")
    stabilityChart = new Chart(stabilityCtx, {
      type: "line",
      data: {
        labels: Array(30).fill(""),
        datasets: [
          {
            label: "Pose Stability",
            data: Array(30).fill(0),
            borderColor: "#4a6cf7",
            backgroundColor: "rgba(74, 108, 247, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    const movementCtx = document.getElementById("movement-chart").getContext("2d")
    movementChart = new Chart(movementCtx, {
      type: "bar",
      data: {
        labels: ["Head", "Shoulders", "Elbows", "Wrists", "Hips", "Knees", "Ankles"],
        datasets: [
          {
            label: "Movement Intensity",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(74, 108, 247, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
  }

  // Load the TensorFlow.js pose detection model
  async function loadModel() {
    loadingIndicator.classList.remove("hidden")
    try {
      switch (modelType) {
        case "movenet":
          model = poseDetection.SupportedModels.MoveNet
          detector = await poseDetection.createDetector(model, {
            modelType: "lightning",
            enableSmoothing: true,
          })
          break
        case "posenet":
          model = poseDetection.SupportedModels.PoseNet
          detector = await poseDetection.createDetector(model, {
            quantBytes: 4,
            architecture: "MobileNetV1",
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75,
          })
          break
        case "blazepose":
          model = poseDetection.SupportedModels.BlazePose
          detector = await poseDetection.createDetector(model, {
            runtime: "tfjs",
            modelType: "full",
          })
          break
      }
      isModelLoaded = true
      console.log(`${modelType} model loaded successfully`)
    } catch (error) {
      console.error("Error loading model:", error)
      alert(`Failed to load the ${modelType} model. Please try a different model or refresh the page.`)
    } finally {
      loadingIndicator.classList.add("hidden")
    }
  }

  // Set up the webcam
  async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support the webcam API. Please try a different browser.")
      noWebcamMessage.classList.remove("hidden")
      return
    }

    const [width, height] = settings.resolution.split("x").map(Number)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: width,
          height: height,
        },
        audio: false,
      })

      video.srcObject = stream
      await video.play()

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      isWebcamRunning = true
      videoSource = "camera"
      noWebcamMessage.classList.add("hidden")

      // Start pose detection
      if (isModelLoaded) {
        detectPose()
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      noWebcamMessage.classList.remove("hidden")
    }
  }

  // Switch between video sources (camera, upload, url)
  function switchVideoSource(source) {
    // Reset active state on all source buttons
    cameraBtn.classList.remove("active")
    uploadBtn.classList.remove("active")
    urlBtn.classList.remove("active")

    // Stop current video if running
    if (isWebcamRunning && video.srcObject) {
      const tracks = video.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      isWebcamRunning = false
    }

    // Cancel any ongoing animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    videoSource = source

    switch (source) {
      case "camera":
        cameraBtn.classList.add("active")
        setupCamera()
        break
      case "upload":
        uploadBtn.classList.add("active")
        video.srcObject = null
        video.src = previewVideo.src
        video.loop = true
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          video.play()
          detectPose()
        }
        break
      case "url":
        urlBtn.classList.add("active")
        video.srcObject = null
        video.src = urlPreviewVideo.src
        video.loop = true
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          video.play()
          detectPose()
        }
        break
    }
  }

  // Handle file upload for videos
  function handleFileUpload(file) {
    if (file.type.startsWith("video/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewVideo.src = e.target.result
        fileName.textContent = file.name
        fileSize.textContent = formatFileSize(file.size)
        uploadPreview.classList.remove("hidden")
        processUploadBtn.disabled = false
      }
      reader.readAsDataURL(file)
    } else {
      alert("Please upload a video file.")
    }
  }

  // Format file size for display
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Change the pose detection model
  async function changeModel() {
    const newModelType = modelSelect.value
    if (newModelType !== modelType) {
      modelType = newModelType
      isModelLoaded = false

      // Cancel any ongoing detection
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      await loadModel()

      // Restart detection if video is playing
      if (video.readyState === 4) {
        detectPose()
      }
    }
  }

  // Update confidence threshold
  function updateConfidenceThreshold() {
    confidenceThresholdValue = Number.parseFloat(confidenceThreshold.value)
    confidenceValue.textContent = confidenceThresholdValue.toFixed(2)
  }

  // Update detection speed
  function updateDetectionSpeed() {
    detectionSpeedValue = Number.parseInt(detectionSpeed.value)

    let speedText
    switch (detectionSpeedValue) {
      case 1:
        speedText = "Very Slow"
        break
      case 2:
        speedText = "Slow"
        break
      case 3:
        speedText = "Normal"
        break
      case 4:
        speedText = "Fast"
        break
      case 5:
        speedText = "Very Fast"
        break
    }

    speedValue.textContent = speedText
  }

  // Main pose detection loop
  async function detectPose() {
    if (!isModelLoaded || !video.readyState === 4) {
      animationFrameId = requestAnimationFrame(detectPose)
      return
    }

    // Calculate FPS
    frameCount++
    const now = performance.now()
    const elapsed = now - lastFpsUpdateTime

    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed)
      frameCount = 0
      lastFpsUpdateTime = now
      fpsCounter.textContent = fps
    }

    try {
      // Only run detection every N frames based on speed setting
      const skipFrames = 6 - detectionSpeedValue
      if (frameCount % skipFrames === 0) {
        const poses = await detector.estimatePoses(video, {
          maxPoses: Number.parseInt(settings.maxPoses),
          flipHorizontal: settings.mirrorView,
        })

        if (poses.length > 0) {
          // Filter poses by confidence threshold
          const validPoses = poses.filter((pose) => {
            const avgConfidence = pose.keypoints.reduce((sum, kp) => sum + kp.score, 0) / pose.keypoints.length
            return avgConfidence >= confidenceThresholdValue
          })

          // Update UI with pose data
          updatePoseData(validPoses)

          // Draw poses on canvas
          drawPoses(validPoses)

          // Update analytics
          updateAnalytics(validPoses)

          // Track exercise if active
          if (currentExercise) {
            trackExercise(validPoses[0])
          }

          // Record frame if recording
          if (isRecording) {
            recordFrame()
          }
        } else {
          // Clear canvas if no poses detected
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          keypointsCtx.clearRect(0, 0, keypointsCanvas.width, keypointsCanvas.height)

          // Update UI to show no poses
          updateNoPoseData()
        }
      }
    } catch (error) {
      console.error("Error during pose detection:", error)
    }

    // Continue detection loop
    animationFrameId = requestAnimationFrame(detectPose)
  }

  // Draw detected poses on the canvas
  function drawPoses(poses) {
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    poses.forEach((pose) => {
      // Draw skeleton
      if (settings.showSkeleton) {
        drawSkeleton(pose)
      }

      // Draw keypoints
      if (settings.showKeypoints) {
        drawKeypoints(pose)
      }

      // Draw labels
      if (settings.showLabels) {
        drawLabels(pose)
      }
    })
  }

  // Draw the skeleton connecting keypoints
  function drawSkeleton(pose) {
    ctx.strokeStyle = settings.skeletonColor
    ctx.lineWidth = 4

    CONNECTED_KEYPOINTS.forEach(([p1Name, p2Name]) => {
      const p1Index = KEYPOINT_NAMES.indexOf(p1Name)
      const p2Index = KEYPOINT_NAMES.indexOf(p2Name)

      if (p1Index === -1 || p2Index === -1) return

      const p1 = pose.keypoints[p1Index]
      const p2 = pose.keypoints[p2Index]

      if (p1.score >= confidenceThresholdValue && p2.score >= confidenceThresholdValue) {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    })
  }

  // Draw keypoints
  function drawKeypoints(pose) {
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score >= confidenceThresholdValue) {
        ctx.fillStyle = settings.keypointColor
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  // Draw labels for keypoints
  function drawLabels(pose) {
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.font = "14px Arial"
    ctx.textAlign = "center"

    pose.keypoints.forEach((keypoint, index) => {
      if (keypoint.score >= confidenceThresholdValue) {
        const name = KEYPOINT_NAMES[index]
        ctx.beginPath()
        ctx.strokeText(name, keypoint.x, keypoint.y - 10)
        ctx.fillText(name, keypoint.x, keypoint.y - 10)
      }
    })
  }

  // Update the pose data display
  function updatePoseData(poses) {
    if (poses.length === 0) {
      updateNoPoseData()
      return
    }

    // Update main metrics
    const mainPose = poses[0]
    const avgConfidence = mainPose.keypoints.reduce((sum, kp) => sum + kp.score, 0) / mainPose.keypoints.length
    poseConfidence.textContent = `${Math.round(avgConfidence * 100)}%`
    peopleCount.textContent = poses.length

    // Update keypoints list
    keypointsList.innerHTML = ""
    mainPose.keypoints.forEach((keypoint, index) => {
      const name = KEYPOINT_NAMES[index]
      const confidence = Math.round(keypoint.score * 100)

      const keypointItem = document.createElement("div")
      keypointItem.className = "keypoint-item"
      keypointItem.innerHTML = `
                <span class="keypoint-name">${formatKeypointName(name)}</span>
                <span class="keypoint-confidence">${confidence}%</span>
            `
      keypointsList.appendChild(keypointItem)
    })

    // Draw keypoints on the figure
    drawKeypointsOnFigure(mainPose)

    // Update posture analysis
    updatePostureAnalysis(mainPose)

    // Save pose data for history
    lastPoseData = mainPose
    poseHistory.push({
      timestamp: Date.now(),
      pose: mainPose,
    })

    // Limit history length
    if (poseHistory.length > 100) {
      poseHistory.shift()
    }
  }

  // Update UI when no pose is detected
  function updateNoPoseData() {
    poseConfidence.textContent = "0%"
    peopleCount.textContent = "0"

    keypointsList.innerHTML = `
            <div class="keypoint-item">
                <span class="keypoint-name">No pose detected</span>
                <span class="keypoint-confidence">-</span>
            </div>
        `

    // Clear keypoints figure
    keypointsCtx.clearRect(0, 0, keypointsCanvas.width, keypointsCanvas.height)

    // Reset posture analysis
    postureMetrics.querySelectorAll(".posture-metric").forEach((metric) => {
      const progressBar = metric.querySelector(".progress-bar")
      const value = metric.querySelector(".posture-value")
      progressBar.style.width = "0%"
      value.textContent = "0%"
    })
  }

  // Format keypoint name for display
  function formatKeypointName(name) {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Draw keypoints on the human figure
  function drawKeypointsOnFigure(pose) {
    keypointsCtx.clearRect(0, 0, keypointsCanvas.width, keypointsCanvas.height)

    // Scale factors to map from video coordinates to figure coordinates
    const scaleX = keypointsCanvas.width / video.videoWidth
    const scaleY = keypointsCanvas.height / video.videoHeight

    // Draw skeleton
    keypointsCtx.strokeStyle = settings.skeletonColor
    keypointsCtx.lineWidth = 2

    CONNECTED_KEYPOINTS.forEach(([p1Name, p2Name]) => {
      const p1Index = KEYPOINT_NAMES.indexOf(p1Name)
      const p2Index = KEYPOINT_NAMES.indexOf(p2Name)

      if (p1Index === -1 || p2Index === -1) return

      const p1 = pose.keypoints[p1Index]
      const p2 = pose.keypoints[p2Index]

      if (p1.score >= confidenceThresholdValue && p2.score >= confidenceThresholdValue) {
        keypointsCtx.beginPath()
        keypointsCtx.moveTo(p1.x * scaleX, p1.y * scaleY)
        keypointsCtx.lineTo(p2.x * scaleX, p2.y * scaleY)
        keypointsCtx.stroke()
      }
    })

    // Draw keypoints
    keypointsCtx.fillStyle = settings.keypointColor

    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score >= confidenceThresholdValue) {
        keypointsCtx.beginPath()
        keypointsCtx.arc(keypoint.x * scaleX, keypoint.y * scaleY, 3, 0, 2 * Math.PI)
        keypointsCtx.fill()
      }
    })
  }

  // Update posture analysis
  function updatePostureAnalysis(pose) {
    // Calculate shoulder alignment (horizontal)
    const leftShoulder = pose.keypoints[KEYPOINT_NAMES.indexOf("left_shoulder")]
    const rightShoulder = pose.keypoints[KEYPOINT_NAMES.indexOf("right_shoulder")]

    let shoulderAlignment = 0
    if (leftShoulder.score >= confidenceThresholdValue && rightShoulder.score >= confidenceThresholdValue) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
      const shoulderDist = Math.sqrt(
        Math.pow(leftShoulder.x - rightShoulder.x, 2) + Math.pow(leftShoulder.y - rightShoulder.y, 2),
      )
      shoulderAlignment = 100 - Math.min(100, (shoulderDiff / shoulderDist) * 200)
    }

    // Calculate hip alignment (horizontal)
    const leftHip = pose.keypoints[KEYPOINT_NAMES.indexOf("left_hip")]
    const rightHip = pose.keypoints[KEYPOINT_NAMES.indexOf("right_hip")]

    let hipAlignment = 0
    if (leftHip.score >= confidenceThresholdValue && rightHip.score >= confidenceThresholdValue) {
      const hipDiff = Math.abs(leftHip.y - rightHip.y)
      const hipDist = Math.sqrt(Math.pow(leftHip.x - rightHip.x, 2) + Math.pow(leftHip.y - rightHip.y, 2))
      hipAlignment = 100 - Math.min(100, (hipDiff / hipDist) * 200)
    }

    // Calculate spine angle (vertical)
    const nose = pose.keypoints[KEYPOINT_NAMES.indexOf("nose")]

    let spineAngle = 0
    if (
      nose.score >= confidenceThresholdValue &&
      leftShoulder.score >= confidenceThresholdValue &&
      leftHip.score >= confidenceThresholdValue
    ) {
      // Calculate angle between vertical line and line from hip to shoulder
      const dx = leftShoulder.x - leftHip.x
      const dy = leftShoulder.y - leftHip.y
      const angle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI))
      spineAngle = 100 - Math.min(100, angle * 2)
    }

    // Update UI
    const metrics = postureMetrics.querySelectorAll(".posture-metric")

    // Shoulder alignment
    const shoulderMetric = metrics[0]
    const shoulderBar = shoulderMetric.querySelector(".progress-bar")
    const shoulderValue = shoulderMetric.querySelector(".posture-value")
    shoulderBar.style.width = `${shoulderAlignment}%`
    shoulderValue.textContent = `${Math.round(shoulderAlignment)}%`

    // Hip alignment
    const hipMetric = metrics[1]
    const hipBar = hipMetric.querySelector(".progress-bar")
    const hipValue = hipMetric.querySelector(".posture-value")
    hipBar.style.width = `${hipAlignment}%`
    hipValue.textContent = `${Math.round(hipAlignment)}%`

    // Spine angle
    const spineMetric = metrics[2]
    const spineBar = spineMetric.querySelector(".progress-bar")
    const spineValue = spineMetric.querySelector(".posture-value")
    spineBar.style.width = `${spineAngle}%`
    spineValue.textContent = `${Math.round(spineAngle)}%`
  }

  // Update analytics charts and metrics
  function updateAnalytics(poses) {
    if (poses.length === 0 || !lastPoseData) return

    const pose = poses[0]

    // Calculate pose stability (inverse of movement)
    let totalMovement = 0
    let keypointCount = 0

    pose.keypoints.forEach((keypoint, i) => {
      const lastKeypoint = lastPoseData.keypoints[i]
      if (keypoint.score >= confidenceThresholdValue && lastKeypoint.score >= confidenceThresholdValue) {
        const distance = Math.sqrt(Math.pow(keypoint.x - lastKeypoint.x, 2) + Math.pow(keypoint.y - lastKeypoint.y, 2))
        totalMovement += distance
        keypointCount++
      }
    })

    const avgMovement = keypointCount > 0 ? totalMovement / keypointCount : 0
    const stability = Math.max(0, 100 - avgMovement * 2)

    // Update stability chart
    stabilityChart.data.datasets[0].data.push(stability)
    stabilityChart.data.datasets[0].data.shift()
    stabilityChart.update()

    // Calculate movement intensity for different body parts
    const bodyParts = [
      ["nose", "left_eye", "right_eye"], // Head
      ["left_shoulder", "right_shoulder"], // Shoulders
      ["left_elbow", "right_elbow"], // Elbows
      ["left_wrist", "right_wrist"], // Wrists
      ["left_hip", "right_hip"], // Hips
      ["left_knee", "right_knee"], // Knees
      ["left_ankle", "right_ankle"], // Ankles
    ]

    const movementData = bodyParts.map((part) => {
      let partMovement = 0
      let partCount = 0

      part.forEach((keypointName) => {
        const index = KEYPOINT_NAMES.indexOf(keypointName)
        if (index !== -1) {
          const keypoint = pose.keypoints[index]
          const lastKeypoint = lastPoseData.keypoints[index]

          if (keypoint.score >= confidenceThresholdValue && lastKeypoint.score >= confidenceThresholdValue) {
            const distance = Math.sqrt(
              Math.pow(keypoint.x - lastKeypoint.x, 2) + Math.pow(keypoint.y - lastKeypoint.y, 2),
            )
            partMovement += distance
            partCount++
          }
        }
      })

      return partCount > 0 ? Math.min(100, (partMovement / partCount) * 5) : 0
    })

    // Update movement chart
    movementChart.data.datasets[0].data = movementData
    movementChart.update()

    // Update analytics metrics
    const avgConfidence = pose.keypoints.reduce((sum, kp) => sum + kp.score, 0) / pose.keypoints.length
    avgConfidence.textContent = `${Math.round(avgConfidence * 100)}%`

    // Determine movement intensity label
    const avgMovementIntensity = movementData.reduce((sum, val) => sum + val, 0) / movementData.length
    let intensityLabel

    if (avgMovementIntensity < 10) intensityLabel = "Very Low"
    else if (avgMovementIntensity < 25) intensityLabel = "Low"
    else if (avgMovementIntensity < 50) intensityLabel = "Medium"
    else if (avgMovementIntensity < 75) intensityLabel = "High"
    else intensityLabel = "Very High"

    movementIntensity.textContent = intensityLabel

    // Calculate posture score
    const shoulderMetric = postureMetrics.querySelectorAll(".posture-metric")[0]
    const hipMetric = postureMetrics.querySelectorAll(".posture-metric")[1]
    const spineMetric = postureMetrics.querySelectorAll(".posture-metric")[2]

    const shoulderScore = Number.parseInt(shoulderMetric.querySelector(".posture-value").textContent)
    const hipScore = Number.parseInt(hipMetric.querySelector(".posture-value").textContent)
    const spineScore = Number.parseInt(spineMetric.querySelector(".posture-value").textContent)

    const overallScore = Math.round((shoulderScore + hipScore + spineScore) / 3)
    postureScore.textContent = `${overallScore}/100`
  }

  // Start exercise tracking
  function startExercise(exerciseName) {
    currentExercise = exerciseName
    exerciseStartTime = Date.now()
    repCounter = 0
    isInUpperPosition = false

    // Update UI
    exerciseTracker.classList.remove("hidden")
    document.getElementById("exercise-name").textContent = formatKeypointName(exerciseName)
    repCount.textContent = "0"
    formQuality.textContent = "0%"
    caloriesBurned.textContent = "0"
    exerciseTime.textContent = "00:00"

    // Reset progress circle
    progressCircle.style.strokeDashoffset = "339.292"

    // Clear feedback list
    feedbackList.innerHTML = "<li>Starting exercise tracking...</li>"

    // Start exercise timer
    startExerciseTimer()
  }

  // Stop exercise tracking
  function stopExercise() {
    currentExercise = null
    exerciseTracker.classList.add("hidden")
  }

  // Start exercise timer
  function startExerciseTimer() {
    const updateTimer = () => {
      if (!currentExercise) return

      const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0")
      const seconds = (elapsed % 60).toString().padStart(2, "0")

      exerciseTime.textContent = `${minutes}:${seconds}`

      // Update calories (very rough estimate)
      const caloriesPerMinute = 5 // Varies by exercise
      const caloriesBurnedValue = Math.round((elapsed / 60) * caloriesPerMinute)
      caloriesBurned.textContent = caloriesBurnedValue

      requestAnimationFrame(updateTimer)
    }

    updateTimer()
  }

  // Track exercise repetitions and form
  function trackExercise(pose) {
    if (!currentExercise || !pose) return

    const exerciseConfig = EXERCISE_DEFINITIONS[currentExercise]
    if (!exerciseConfig) return

    // Get keypoints for the exercise
    const keypointIndices = exerciseConfig.keypoints.map((name) => KEYPOINT_NAMES.indexOf(name))
    const keypoints = keypointIndices.map((index) => pose.keypoints[index])

    // Check if all required keypoints are detected with sufficient confidence
    if (keypoints.some((kp) => kp.score < confidenceThresholdValue)) {
      updateFeedback(["Position yourself so all body parts are visible"])
      return
    }

    // Calculate angle between three points
    const calculateAngle = (p1, p2, p3) => {
      const angle =
        Math.abs(Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)) * (180 / Math.PI)
      return angle > 180 ? 360 - angle : angle
    }

    // For exercises that track repetitions based on angle changes
    if (exerciseConfig.startAngle && exerciseConfig.endAngle) {
      const angle = calculateAngle(keypoints[0], keypoints[1], keypoints[2])

      // Check for rep completion
      if (!isInUpperPosition && angle <= exerciseConfig.endAngle + 15) {
        isInUpperPosition = true
        updateFeedback(["Good! Now return to starting position"])
      } else if (isInUpperPosition && angle >= exerciseConfig.startAngle - 15) {
        isInUpperPosition = false
        repCounter++
        repCount.textContent = repCounter

        // Update progress circle
        const circumference = 339.292 // 2 * PI * 54 (circle radius)
        const offset = circumference - ((repCounter % 10) / 10) * circumference
        progressCircle.style.strokeDashoffset = offset

        // Calculate form quality
        const formQualityValue = calculateFormQuality(pose, exerciseConfig)
        formQuality.textContent = `${formQualityValue}%`

        updateFeedback(["Rep completed!", ...generateFormFeedback(pose, exerciseConfig)])
      }
    }
    // For exercises that maintain a position (like plank)
    else if (exerciseConfig.targetAngle) {
      const angle = calculateAngle(keypoints[0], keypoints[1], keypoints[2])
      const deviation = Math.abs(angle - exerciseConfig.targetAngle)

      // Check if position is maintained correctly
      if (deviation <= exerciseConfig.tolerance) {
        // Update form quality
        const formQualityValue = 100 - Math.round((deviation / exerciseConfig.tolerance) * 100)
        formQuality.textContent = `${formQualityValue}%`

        updateFeedback(["Good form!", ...generateFormFeedback(pose, exerciseConfig)])
      } else {
        // Update form quality
        const formQualityValue = Math.max(0, 100 - Math.round((deviation / exerciseConfig.tolerance) * 100))
        formQuality.textContent = `${formQualityValue}%`

        updateFeedback(["Adjust your position", ...generateFormFeedback(pose, exerciseConfig)])
      }
    }
  }

  // Calculate form quality for an exercise
  function calculateFormQuality(pose, exerciseConfig) {
    // This is a simplified version - in a real app, this would be more sophisticated
    // and specific to each exercise type

    let qualityScore = 100

    // Check alignment issues
    const feedbackItems = generateFormFeedback(pose, exerciseConfig)
    qualityScore -= feedbackItems.length * 10

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, qualityScore))
  }

  // Generate feedback for exercise form
  function generateFormFeedback(pose, exerciseConfig) {
    const feedback = []

    // This is a simplified version - in a real app, this would analyze specific
    // form issues for each exercise type

    // Example checks for squat
    if (exerciseConfig === EXERCISE_DEFINITIONS.squat) {
      // Check knee position relative to toes
      const leftKnee = pose.keypoints[KEYPOINT_NAMES.indexOf("left_knee")]
      const leftAnkle = pose.keypoints[KEYPOINT_NAMES.indexOf("left_ankle")]

      if (leftKnee.x < leftAnkle.x - 50) {
        feedback.push(exerciseConfig.feedback.kneeOverToes)
      }

      // Check back alignment
      const leftShoulder = pose.keypoints[KEYPOINT_NAMES.indexOf("left_shoulder")]
      const leftHip = pose.keypoints[KEYPOINT_NAMES.indexOf("left_hip")]

      const shoulderHipAngle = Math.atan2(leftShoulder.y - leftHip.y, leftShoulder.x - leftHip.x) * (180 / Math.PI)
      if (shoulderHipAngle < 45) {
        feedback.push(exerciseConfig.feedback.backStraight)
      }
    }

    return feedback
  }

  // Update feedback list
  function updateFeedback(feedbackItems) {
    feedbackList.innerHTML = ""

    feedbackItems.forEach((item) => {
      const li = document.createElement("li")
      li.textContent = item
      feedbackList.appendChild(li)
    })
  }

  // Capture snapshot of current pose
  function captureSnapshot() {
    if (!lastPoseData) {
      alert("No pose detected. Please make sure you are visible in the camera.")
      return
    }

    // Create snapshot canvas
    const snapshotCanvas = document.createElement("canvas")
    snapshotCanvas.width = canvas.width
    snapshotCanvas.height = canvas.height
    const snapshotCtx = snapshotCanvas.getContext("2d")

    // Draw video frame
    snapshotCtx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height)

    // Draw pose overlay
    snapshotCtx.drawImage(canvas, 0, 0)

    // Create snapshot data
    const snapshot = {
      id: Date.now(),
      image: snapshotCanvas.toDataURL("image/png"),
      pose: JSON.parse(JSON.stringify(lastPoseData)),
      timestamp: new Date().toLocaleString(),
    }

    // Add to snapshots array
    snapshots.push(snapshot)

    // Update snapshots grid
    updateSnapshotsGrid()

    // Switch to snapshots tab
    tabBtns.forEach((btn) => {
      if (btn.dataset.tab === "snapshots") {
        btn.click()
      }
    })
  }

  // Update snapshots grid
  function updateSnapshotsGrid() {
    if (snapshots.length === 0) {
      snapshotsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-camera"></i>
                    <p>No snapshots captured yet</p>
                    <p>Take a snapshot to analyze your pose</p>
                </div>
            `
      return
    }

    snapshotsGrid.innerHTML = ""

    snapshots.forEach((snapshot) => {
      const snapshotCard = document.createElement("div")
      snapshotCard.className = "snapshot-card"
      snapshotCard.innerHTML = `
                <div class="snapshot-image">
                    <img src="${snapshot.image}" alt="Pose Snapshot">
                </div>
                <div class="snapshot-info">
                    <div class="snapshot-time">${snapshot.timestamp}</div>
                    <div class="snapshot-actions">
                        <button class="icon-btn view-snapshot" data-id="${snapshot.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn delete-snapshot" data-id="${snapshot.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `
      snapshotsGrid.appendChild(snapshotCard)
    })

    // Add event listeners to snapshot buttons
    document.querySelectorAll(".view-snapshot").forEach((btn) => {
      btn.addEventListener("click", () => viewSnapshot(btn.dataset.id))
    })

    document.querySelectorAll(".delete-snapshot").forEach((btn) => {
      btn.addEventListener("click", () => deleteSnapshot(btn.dataset.id))
    })
  }

  // View snapshot details
  function viewSnapshot(id) {
    const snapshot = snapshots.find((s) => s.id === Number.parseInt(id))
    if (!snapshot) return

    // Create modal for snapshot details
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-camera"></i> Snapshot Details</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="snapshot-details">
                        <div class="snapshot-image-large">
                            <img src="${snapshot.image}" alt="Pose Snapshot">
                        </div>
                        <div class="snapshot-metrics">
                            <h3>Pose Metrics</h3>
                            <div class="metrics-grid">
                                <div class="metric-item">
                                    <div class="metric-label">Confidence</div>
                                    <div class="metric-value">${Math.round(snapshot.pose.score * 100)}%</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Keypoints</div>
                                    <div class="metric-value">${snapshot.pose.keypoints.length}</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Timestamp</div>
                                    <div class="metric-value">${snapshot.timestamp}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn close-modal">Close</button>
                    <button class="primary-btn" id="download-snapshot">Download</button>
                </div>
            </div>
        `

    document.body.appendChild(modal)

    // Add event listeners
    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.removeChild(modal)
      })
    })

    modal.querySelector("#download-snapshot").addEventListener("click", () => {
      const link = document.createElement("a")
      link.download = `pose-snapshot-${snapshot.id}.png`
      link.href = snapshot.image
      link.click()
    })

    // Show modal
    setTimeout(() => {
      modal.style.display = "block"
    }, 10)
  }

  // Delete snapshot
  function deleteSnapshot(id) {
    const index = snapshots.findIndex((s) => s.id === Number.parseInt(id))
    if (index !== -1) {
      snapshots.splice(index, 1)
      updateSnapshotsGrid()
    }
  }

  // Toggle recording
  function toggleRecording() {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Start recording
  function startRecording() {
    if (!lastPoseData) {
      alert("No pose detected. Please make sure you are visible in the camera.")
      return
    }

    isRecording = true
    recordingStartTime = Date.now()
    recordedFrames = []
    recordBtn.classList.add("active")
    recordBtn.innerHTML = '<i class="fas fa-stop-circle"></i>'
  }

  // Stop recording
  function stopRecording() {
    if (!isRecording) return

    isRecording = false
    recordBtn.classList.remove("active")
    recordBtn.innerHTML = '<i class="fas fa-record-vinyl"></i>'

    // Process recorded frames
    if (recordedFrames.length > 0) {
      alert(`Recording stopped. ${recordedFrames.length} frames captured.`)
      // In a real app, this would create a video or animation from the frames
    }
  }

  // Record current frame
  function recordFrame() {
    if (!isRecording) return

    // Create a copy of the current canvas
    const frameCanvas = document.createElement("canvas")
    frameCanvas.width = canvas.width
    frameCanvas.height = canvas.height
    const frameCtx = frameCanvas.getContext("2d")

    // Draw video frame
    frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height)

    // Draw pose overlay
    frameCtx.drawImage(canvas, 0, 0)

    // Add to recorded frames
    recordedFrames.push({
      image: frameCanvas.toDataURL("image/png"),
      pose: JSON.parse(JSON.stringify(lastPoseData)),
      timestamp: Date.now() - recordingStartTime,
    })
  }

  // Toggle fullscreen
  function toggleFullscreen() {
    const container = document.querySelector(".video-container")

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  // Export results
  function exportResults() {
    const data = {
      poseHistory: poseHistory,
      snapshots: snapshots,
      analytics: {
        avgConfidence: avgConfidence.textContent,
        movementIntensity: movementIntensity.textContent,
        postureScore: postureScore.textContent,
      },
      timestamp: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportName = `pose-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportName)
    linkElement.click()
  }

  // Clear results
  function clearResults() {
    if (confirm("Are you sure you want to clear all results? This cannot be undone.")) {
      poseHistory = []
      snapshots = []
      updateSnapshotsGrid()

      // Reset charts
      stabilityChart.data.datasets[0].data = Array(30).fill(0)
      stabilityChart.update()

      movementChart.data.datasets[0].data = Array(7).fill(0)
      movementChart.update()

      // Reset analytics
      avgConfidence.textContent = "0%"
      movementIntensity.textContent = "Low"
      postureScore.textContent = "0/100"
    }
  }

  // Open modal
  function openModal(modal) {
    modal.style.display = "block"
  }

  // Close modal
  function closeModal(modal) {
    modal.style.display = "none"
  }

  // Save settings
  function saveSettings() {
    settings = {
      showSkeleton: showSkeleton.checked,
      showKeypoints: showKeypoints.checked,
      showLabels: showLabels.checked,
      mirrorView: mirrorView.checked,
      maxPoses: Number.parseInt(maxPoses.value),
      skeletonColor: skeletonColor.value,
      keypointColor: keypointColor.value,
      resolution: cameraResolution.value,
    }

    closeModal(settingsModal)

    // If camera is active, restart it with new settings
    if (videoSource === "camera") {
      switchVideoSource("camera")
    }
  }

  // Initialize the application
  init()
})

