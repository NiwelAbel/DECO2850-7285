import { useEffect, useRef, useState } from "react";
import { Mic, Play, Square, Send, Trash2 } from "lucide-react";

import Header from "../components/Header";
import Nav from "../components/Nav";

export default function Messages({ setPage }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [sentVoice, setSentVoice] = useState(null);
  const [permissionError, setPermissionError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  /*
   * Start REAL microphone recording
   */
  const startRecording = async () => {
    try {
      setPermissionError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionError(
          "Your browser does not support microphone recording."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop microphone access
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      recorder.start();

      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error(error);

      setPermissionError(
        "Microphone permission was denied. Please allow microphone access and try again."
      );
    }
  };

  /*
   * Stop REAL microphone recording
   */
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);

    clearInterval(timerRef.current);
  };

  /*
   * Delete current recording
   */
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setRecordTime(0);
  };

  /*
   * Send recording into conversation
   */
  const sendRecording = () => {
    if (!audioUrl || !audioBlob) {
      return;
    }

    setSentVoice({
      url: audioUrl,
      duration: recordTime
    });

    setAudioUrl(null);
    setAudioBlob(null);
    setRecordTime(0);
  };

  /*
   * Cleanup when leaving the page
   */
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(track => track.stop());
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="mobile-screen app-screen">

      <main className="content messages-content">

        <Header title="Voice Messages" />

        <div className="listening">
          🐻
          <span>Bear is listening</span>
        </div>

        {/* Child's first message */}
        <VoiceMessage
          from="Your child"
          time="Today 6:30 PM"
          duration="0:12"
          fresh
        />

        {/* Child's second message */}
        <VoiceMessage
          from="Your child"
          time="Today 4:15 PM"
          duration="0:25"
        />

        {/* Previous parent message */}
        <VoiceMessage
          from="You"
          time="Today 2:10 PM"
          duration="0:18"
          mine
        />

        {/* NEW REAL RECORDING */}
        {sentVoice && (
          <RecordedVoice
            audioUrl={sentVoice.url}
            duration={sentVoice.duration}
          />
        )}

        {permissionError && (
          <div className="record-error">
            {permissionError}
          </div>
        )}

      </main>

      {/* Recording / preview controls */}
      <div className="record-area">

        {!recording && !audioUrl && (
          <button
            className="record"
            onClick={startRecording}
          >
            <Mic size={21} />
            Record a reply
          </button>
        )}

        {recording && (
          <div className="recording-controls">

            <div className="recording-status">
              <span className="recording-dot" />

              <div>
                <strong>Recording...</strong>
                <small>
                  00:{String(recordTime).padStart(2, "0")}
                </small>
              </div>
            </div>

            <button
              className="stop-recording"
              onClick={stopRecording}
            >
              <Square
                size={18}
                fill="white"
              />
              Stop
            </button>

          </div>
        )}

        {!recording && audioUrl && (
          <div className="recording-preview">

            <div className="preview-title">
              <div>
                <strong>Your recording</strong>

                <small>
                  00:{String(recordTime).padStart(2, "0")}
                </small>
              </div>
            </div>

            {/* REAL AUDIO PLAYER */}
            <audio
              controls
              src={audioUrl}
              className="audio-player"
            />

            <div className="preview-buttons">

              <button
                className="delete-recording"
                onClick={deleteRecording}
              >
                <Trash2 size={18} />
              </button>

              <button
                className="send-recording"
                onClick={sendRecording}
              >
                <Send size={18} />
                Send
              </button>

            </div>

          </div>
        )}

      </div>

      <Nav
        page="messages"
        setPage={setPage}
      />

    </div>
  );
}


/*
 * Existing voice message
 */
function VoiceMessage({
  from,
  time,
  duration,
  mine,
  fresh
}) {
  const bars = [
    8, 14, 20, 11, 17, 24,
    13, 19, 10, 16, 21, 12,
    18, 9, 15, 22, 12, 18
  ];

  return (
    <div
      className={`voice ${
        mine ? "mine" : ""
      }`}
    >

      <div className="voice-top">

        <strong>
          {from}
        </strong>

        <span>
          {fresh && (
            <b className="new">
              NEW
            </b>
          )}

          {time}
        </span>

      </div>

      <div className="wave-row">

        <button className="play">
          <Play
            size={14}
            fill="white"
          />
        </button>

        <div className="wave">

          {bars.map((height, index) => (
            <i
              key={index}
              style={{
                height
              }}
            />
          ))}

        </div>

        <span>
          {duration}
        </span>

      </div>

    </div>
  );
}


/*
 * Recorded voice message
 */
function RecordedVoice({
  audioUrl,
  duration
}) {
  return (
    <div className="voice mine recorded-voice">

      <div className="voice-top">

        <strong>
          You
        </strong>

        <span>
          Just now
        </span>

      </div>

      <div className="real-audio-message">

        <audio
          controls
          src={audioUrl}
        />

      </div>

    </div>
  );
}