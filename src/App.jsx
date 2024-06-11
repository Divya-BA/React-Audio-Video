import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { MdFileUpload } from 'react-icons/md';
import { AiFillAudio } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [mediaRecorderAudio, setMediaRecorderAudio] = useState(null);
  const [mediaRecorderVideo, setMediaRecorderVideo] = useState(null);
  const [recordedFiles, setRecordedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [videoStream, setVideoStream] = useState(null);

  const chunksAudio = useRef([]);
  const chunksVideo = useRef([]);
  const videoRef = useRef(null);

  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksAudio.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksAudio.current, { type: 'audio/webm' });
        const fileName = `recording-${Date.now()}.webm`;
        setRecordedFiles(prevFiles => [...prevFiles, { blob, fileName }]);
        chunksAudio.current = [];
        stream.getTracks().forEach(track => track.stop());
        toast.success('Audio recording stopped');
      };

      recorder.start();
      setMediaRecorderAudio(recorder);
      setIsRecordingAudio(true);
      toast.info('Audio recording started');
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderAudio) {
      mediaRecorderAudio.stop();
      setIsRecordingAudio(false);
    }
  };

  const startRecordingVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksVideo.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksVideo.current, { type: 'video/webm' });
        const fileName = `recording-${Date.now()}.webm`;
        setRecordedFiles(prevFiles => [...prevFiles, { blob, fileName }]);
        chunksVideo.current = [];
        stream.getTracks().forEach(track => track.stop());
        toast.success('Video recording stopped');
      };

      recorder.start();
      setMediaRecorderVideo(recorder);
      setIsRecordingVideo(true);
      setVideoStream(stream);
      toast.info('Video recording started');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderVideo) {
      mediaRecorderVideo.stop();
      setIsRecordingVideo(false);
      setVideoStream(null);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleAudioRecording = () => {
    if (isRecordingAudio) {
      stopRecordingAudio();
    } else {
      startRecordingAudio();
    }
  };

  const handleVideoRecording = () => {
    if (isRecordingVideo) {
      stopRecordingVideo();
    } else {
      startRecordingVideo();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFiles(prevFiles => [...prevFiles, file]);
    toast.success('File uploaded successfully');
  };

  const playFile = (file) => {
    window.open(URL.createObjectURL(file.blob || file));
  };

  useEffect(() => {
    if (isRecordingVideo && videoStream) {
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.play();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [isRecordingVideo, videoStream]);

  return (
    <div className="screenContainer">
      <ToastContainer />
      <div className="bottomRightIcons">
        <AiFillAudio onClick={handleAudioRecording} className="audioButton" />
        <button onClick={handleVideoRecording} className="recordButton">
          {isRecordingVideo ? <FaStop /> : <FaPlay />}
        </button>
        <label htmlFor="file-upload" className="uploadButton">
          <MdFileUpload />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
      <div className="centerContent">
        {uploadedFiles.map((file, index) => (
          <div className="fileInfo" key={`uploaded-${index}`} onClick={() => playFile(file)}>
            <span>{file.name}</span>
            <button className="playButton">Play</button>
          </div>
        ))}
        {recordedFiles.map((file, index) => (
          <div className="fileInfo" key={`recorded-${index}`} onClick={() => playFile(file)}>
            <span>{file.fileName}</span>
            <button className="playButton">Play</button>
          </div>
        ))}
      </div>
      {isRecordingVideo && (
        <div className="videoContainer">
          <video ref={videoRef} className="videoElement" autoPlay muted />
        </div>
      )}
    </div>
  );
};

export default App;
