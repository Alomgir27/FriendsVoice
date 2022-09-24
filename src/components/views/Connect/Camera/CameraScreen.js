import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image
} from "react-native";
import { Camera } from "expo-camera";
import { Video } from "expo-av";
import moment  from "moment";
const WINDOW_HEIGHT = Dimensions.get("window").height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.032);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);

import { MaterialCommunityIcons } from "react-native-vector-icons";


export default function CameraScreen(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isPreview, setIsPreview] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [autoFocus, setAutoFocus] = useState(Camera.Constants.AutoFocus.on);
  const [whiteBalance, setWhiteBalance] = useState(Camera.Constants.WhiteBalance.auto);
  const [videAndPhotoMode, setVideoAndPhotoMode] = useState('');
  const [ratio, setRatio] = useState("16:9");
  const [depth, setDepth] = useState(0);
  const [audio, setAudio] = useState(0);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const videoRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      setAudio(audioStatus === "granted");
    })();
  }, []);



  useEffect(() => {
    if(props.route.params?.photo) {
      setVideoAndPhotoMode('photo');
    }
    else if(props.route.params?.video) {
      setVideoAndPhotoMode('video');
    }
  }, [props.route.params?.photo, props.route.params?.video]);

  const onToggleFlash = () => {
    if (flashMode === Camera.Constants.FlashMode.off) {
      setFlashMode(Camera.Constants.FlashMode.on);
    } else {
      setFlashMode(Camera.Constants.FlashMode.off);
    }
  };


  const onZoomValueChange = (zoomValue) => {
    setZoom(zoomValue);
  };

  const onToggleFocus = () => {
    if (autoFocus === Camera.Constants.AutoFocus.on) {
      setAutoFocus(Camera.Constants.AutoFocus.off);
    } else {
      setAutoFocus(Camera.Constants.AutoFocus.on);
    }
  };

  const onToggleWB = () => {
    if (whiteBalance === Camera.Constants.WhiteBalance.auto) {
      setWhiteBalance(Camera.Constants.WhiteBalance.sunny);
    } else if (whiteBalance === Camera.Constants.WhiteBalance.sunny) {
      setWhiteBalance(Camera.Constants.WhiteBalance.cloudy);
    } else if (whiteBalance === Camera.Constants.WhiteBalance.cloudy) {
      setWhiteBalance(Camera.Constants.WhiteBalance.shadow);
    } else if (whiteBalance === Camera.Constants.WhiteBalance.shadow) {
      setWhiteBalance(Camera.Constants.WhiteBalance.incandescent);
    } else if (whiteBalance === Camera.Constants.WhiteBalance.incandescent) {
      setWhiteBalance(Camera.Constants.WhiteBalance.fluorescent);
    } else if (whiteBalance === Camera.Constants.WhiteBalance.fluorescent) {
      setWhiteBalance(Camera.Constants.WhiteBalance.auto);
    }
  };

  const onToggleRatio = () => {
    if(ratio === "16:9"){
      setRatio("4:3")
    } else if(ratio === "4:3"){
      setRatio("1:1")
    } else if(ratio === "1:1"){
      setRatio("16:9")
    }
  };

  const onDepthChange = () => {
    if (depth === 0) {
      setDepth(1);
    } else {
      setDepth(0);
    }
  };

  const onSendPicture = async () => {
    if (cameraRef.current) {
      const data = {
        image: capturedPhoto,
        video: videoSource,
      }
      props.navigation.navigate("Post", data);
    }
  };





  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { 
        quality: 0.5,
        base64: true, 
        skipProcessing: true,
        forceUpOrientation: true,

      };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      if (source) {
        await cameraRef.current.pausePreview();
        setIsPreview(true);
        setCapturedPhoto(source);
        console.log("picture source", source);
      }
    }
  };

  const recordVideo = async () => {
    if (cameraRef.current) {
      try {
        if(Platform.OS === 'web'){
          alert("Video recording is not supported on web");
        } else {
          const options = {
            quality: Camera.Constants.VideoQuality["480p"],
          };
          const videoRecordPromise = cameraRef.current.recordAsync(options);
          if (videoRecordPromise) {
            setIsVideoRecording(true);
            setStartTime(Date.now());
            const data = await videoRecordPromise;
            const source = data.uri;
            if (source) {
              setIsPreview(true);
              setIsVideoRecording(false);
              console.log("video source", source);
              setVideoSource(source);
            }
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };
  const stopVideoRecording = () => {
    if (cameraRef.current && Platform.OS !== 'web') {
      setIsPreview(false);
      setIsVideoRecording(false);
      setTimer(0);
      cameraRef.current.stopRecording();
    }
  };
  const switchCamera = () => {
    if (isPreview) {
      return;
    }
    setCameraType((prevCameraType) =>
      prevCameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setVideoSource(null);
    setCapturedPhoto(null);
  };

  useEffect(() => {
    if (isVideoRecording) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVideoRecording]);
  
  
  const renderVideoPlayer = () => (
    <Video
      ref={videoRef}
      source={{ uri: videoSource }}
      shouldPlay={true}
      isLooping
      style={styles.media}
      positionMillis={0}
      progressUpdateIntervalMillis={50}
      resizeMode="cover"
      useNativeControls
      volume={1.0}
    />
  );
  const renderVideoRecordIndicator = useCallback(() => {
    if (isVideoRecording) {
      return (
        <View style={styles.recordIndicatorContainer}>
          <View style={styles.recordDot} />
          <Text style={styles.recordTitle}> {`${moment(Date.now() - startTime).format("mm:ss")} s`}</Text>
        </View>
      );
    }
    return null;
  }, [isVideoRecording, timer]);

  const renderCaptureControl = () => (
    <View style={styles.control}>
      {!isPreview && (
        <><TouchableOpacity disabled={!isCameraReady || isVideoRecording} onPress={() => switchCamera()}>
          <Text style={styles.text}>
            <MaterialCommunityIcons name="sync-circle" size={50} color="white" />
          </Text>
        </TouchableOpacity><TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (videAndPhotoMode === 'photo') {
                if (!isPreview && !isVideoRecording) {
                  takePicture();
                }
              }
              else {
                if (isVideoRecording) {
                  stopVideoRecording();
                }
                else {
                  recordVideo();
                }
              }
            } }
            style={[styles.capture, { backgroundColor: videAndPhotoMode === 'video' ? "red" : "white", borderColor: videAndPhotoMode === 'video' ? "white" : "red", borderWidth: videAndPhotoMode === 'video' && !isVideoRecording ? 5 : 0 }]} /></>
      )}
      <TouchableOpacity disabled={!capturedPhoto && !videoSource} onPress={onSendPicture}
      style={{marginBottom: isPreview? 60 : 0}}
      >
        <Text style={styles.text}>
          <MaterialCommunityIcons name="send-circle" size={50} color="white" />
        </Text>
      </TouchableOpacity>

    </View>
  );

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  const onToggleVideoAndPhotoMode = () => {
    if(videAndPhotoMode === 'photo'){
      setVideoAndPhotoMode('video');
    }else{
      setVideoAndPhotoMode('photo');
    }
  }

  return (
   <SafeAreaView style={styles.containerCamera}>
    <Camera
      ref={cameraRef}
      style={styles.container}
      type={cameraType}
      flashMode={flashMode}
      autoFocus={autoFocus}
      whiteBalance={whiteBalance}
      zoom={zoom}
      ratio={ratio}
      usePoster={true}
      resizeMode={'cover'}
      onCameraReady={() => setIsCameraReady(true)}
      
      isImageMirror={false}
      onMountError={(error) => {
        console.log("onMountError", error);
      }}
    >
        <View style={styles.header}>
        <TouchableOpacity onPress={() => isPreview ? cancelPreview() : onToggleVideoAndPhotoMode()}
        disabled={isVideoRecording}
        style={{ zIndex: 99}}
        >
          <Text style={styles.text}>
            {isPreview ? <MaterialCommunityIcons name="close" size={30} color="white" zIndex={99} /> :
             videAndPhotoMode !== 'photo' ? <MaterialCommunityIcons name="camera" size={30} color="white" /> : <MaterialCommunityIcons name="video" size={30} color="white" />}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleFlash}>  
          <Text style={styles.text}>
            <MaterialCommunityIcons
              name={
                flashMode === Camera.Constants.FlashMode.off
                  ? "flash-off"
                  : "flash"
              }
              size={30}
              color="white"
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleRatio}
        disabled={isPreview}
        >
          <Text style={styles.text}>
            <MaterialCommunityIcons
              name={
                ratio === "16:9"
                  ? "aspect-ratio"
                  : ratio === "4:3"
                  ? "aspect-ratio"
                  : "crop-free"
              }
              size={30}
              color="white"
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleFocus}
        disabled={isPreview}
        >
          <Text style={styles.text}>
            <MaterialCommunityIcons
              name={
                autoFocus === Camera.Constants.AutoFocus.on
                  ? "eye"
                  : "eye-off"
              }
              size={30}
              color="white"
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleWB}>
          <Text style={styles.text}>
             
            <MaterialCommunityIcons
              name={
                whiteBalance === Camera.Constants.WhiteBalance.auto
                  ? "weather-sunny"
                  : whiteBalance === Camera.Constants.WhiteBalance.sunny
                  ? "weather-sunny"
                  : whiteBalance === Camera.Constants.WhiteBalance.cloudy
                  ? "weather-cloudy"  
                  : whiteBalance === Camera.Constants.WhiteBalance.shadow
                  ? "weather-sunset-down"
                  : whiteBalance === Camera.Constants.WhiteBalance.incandescent
                  ? "weather-lightning"
                  : whiteBalance === Camera.Constants.WhiteBalance.fluorescent
                  ? "weather-sunny-alert"
                  : "weather-sunny"
              }
              size={30}
              color="white"
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDepthChange}
        disabled={isPreview}
        >
          <Text style={styles.text}>
            <MaterialCommunityIcons
              name={
                depth === 0
                  ? "camera-metering-spot"
                  : "camera-metering-matrix"
              }
              size={30}
              color="white"
            />
          </Text>
        </TouchableOpacity>
      </View>
      {isPreview && videoSource && renderVideoPlayer()}
      {renderVideoRecordIndicator()}
      {renderCaptureControl()}
     </Camera>
    </SafeAreaView>
  );
  
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: 85,
    left: 30,
    height: closeButtonSize,
    width: closeButtonSize,
    borderRadius: Math.floor(closeButtonSize / 2),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
    zIndex: 2,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  control: {
    position: "absolute",
    flexDirection: "row",
    bottom: 38,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: {
    // borderRadius: 5,
    height: captureSize,
    width: captureSize,
    borderRadius: Math.floor(captureSize / 2),
    marginHorizontal: 31,
  },
  
  recordIndicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 85,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
  
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 30,
    marginTop: 50,
  },
  containerCamera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    backgroundColor: "transparent",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
  text: {
    fontSize: 14,
    color: "white",
  },
  video: {
    flex: 1,
    width: "100%",
  },
  videoPlayer: {
    flex: 1,
    width: "100%",
  },
  videoPlayerControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  videoPlayerControl: {
    padding: 16,
  },
  
});