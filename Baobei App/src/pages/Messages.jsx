import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Play,
  Pause,
  Square,
  Send,
  Trash2
} from "lucide-react";

import Header from "../components/Header";
import Nav from "../components/Nav";

export default function Messages({ setPage }) {
  const [recording, setRecording] = useState(false);

  // Current recording
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);

  // All sent recordings
  const [sentVoices, setSentVoices] = useState([]);

  const [permissionError, setPermissionError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  /*
   * =====================================================
   * START RECORDING
   * =====================================================
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

      recorder.ondataavailable = (event) => {
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

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }
      };

      recorder.start();

      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((previous) => previous + 1);
      }, 1000);

    } catch (error) {
      console.error(error);

      setPermissionError(
        "Microphone permission was denied. Please allow microphone access and try again."
      );
    }
  };


  /*
   * =====================================================
   * STOP RECORDING
   * =====================================================
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
   * =====================================================
   * DELETE CURRENT RECORDING
   * =====================================================
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
   * =====================================================
   * SEND RECORDING
   * =====================================================
   */

  const sendRecording = () => {
    if (!audioUrl || !audioBlob) {
      return;
    }

    const newVoice = {
      id: Date.now(),
      url: audioUrl,
      duration: recordTime
    };

    // IMPORTANT:
    // Add the new message instead of replacing old messages.
    setSentVoices((previous) => [
      ...previous,
      newVoice
    ]);

    // Do NOT revoke audioUrl here.
    // The message is still using this URL.

    setAudioUrl(null);
    setAudioBlob(null);
    setRecordTime(0);
  };


  /*
   * =====================================================
   * CLEANUP ONLY WHEN PAGE IS DESTROYED
   * =====================================================
   */

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      // Don't revoke URLs belonging to sent messages here.
      // They need to remain playable while the page exists.
    };
  }, []);


  /*
   * =====================================================
   * FORMAT TIME
   * =====================================================
   */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };


  return (
    <div className="mobile-screen app-screen">

      {/* =================================================
          SCROLLABLE CONTENT
          ================================================= */}

      <main className="content messages-content">

        <Header title="Voice Messages" />

        <div className="listening">
          🐻
          <span>Bear is listening</span>
        </div>


        {/* =================================================
            CHILD MESSAGE
            ================================================= */}

        <VoiceMessage
          from="Your child"
          time="Today 6:30 PM"
          duration="0:12"
          fresh
        />


        <VoiceMessage
          from="Your child"
          time="Today 4:15 PM"
          duration="0:25"
        />


        {/* =================================================
            EXISTING PARENT MESSAGE
            ================================================= */}

        <VoiceMessage
          from="You"
          time="Today 2:10 PM"
          duration="0:18"
          mine
        />


        {/* =================================================
            ALL NEW RECORDINGS
            ================================================= */}

        {sentVoices.map((voice, index) => (
          <RecordedVoice
            key={voice.id}
            audioUrl={voice.url}
            duration={voice.duration}
            number={index + 1}
            formatTime={formatTime}
          />
        ))}


        {/* =================================================
            ERROR
            ================================================= */}

        {permissionError && (
          <div className="record-error">
            {permissionError}
          </div>
        )}

      </main>


      {/* ===================================================
          RECORDING CONTROLS
          =================================================== */}

      <div className="record-area">

        {/* NORMAL */}

        {!recording && !audioUrl && (
          <button
            className="record"
            onClick={startRecording}
          >
            <Mic size={21} />
            Record a reply
          </button>
        )}


        {/* RECORDING */}

        {recording && (
          <div className="recording-controls">

            <div className="recording-status">

              <span className="recording-dot" />

              <div>
                <strong>
                  Recording...
                </strong>

                <small>
                  {formatTime(recordTime)}
                </small>
              </div>

            </div>


            <button
              className="stop-recording"
              onClick={stopRecording}
            >
              <Square
                size={17}
                fill="white"
              />

              Stop
            </button>

          </div>
        )}


        {/* PREVIEW */}

        {!recording && audioUrl && (

          <div className="recording-preview">

            <div className="preview-title">

              <strong>
                Your recording
              </strong>

              <small>
                {formatTime(recordTime)}
              </small>

            </div>


            {/* REAL PLAYBACK */}

            <audio
              controls
              preload="metadata"
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


      {/* ===================================================
          BOTTOM NAV
          =================================================== */}

      <Nav
        page="messages"
        setPage={setPage}
      />

    </div>
  );
}


/* =========================================================
   NORMAL VOICE MESSAGE
   ========================================================= */

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
      className={`voice ${mine ? "mine" : ""}`}
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


/* =========================================================
   REAL RECORDED VOICE MESSAGE
   ========================================================= */

function RecordedVoice({
  audioUrl,
  duration,
  number,
  formatTime
}) {

  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);


  /*
   * PLAY / PAUSE
   */

  const togglePlayback = async () => {

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {

      if (audio.paused) {

        await audio.play();

        setPlaying(true);

      } else {

        audio.pause();

        setPlaying(false);

      }

    } catch (error) {
      console.error("Playback error:", error);
    }
  };


  /*
   * WHEN AUDIO FINISHES
   */

  const handleEnded = () => {
    setPlaying(false);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };


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


      <div className="recorded-audio-row">

        {/* CUSTOM PLAY BUTTON */}

        <button
          className="recorded-play"
          onClick={togglePlayback}
          aria-label={
            playing
              ? "Pause voice message"
              : "Play voice message"
          }
        >

          {playing ? (
            <Pause
              size={15}
              fill="white"
            />
          ) : (
            <Play
              size={15}
              fill="white"
            />
          )}

        </button>


        {/* WAVEFORM */}

        <div className="recorded-wave">

          {[12, 18, 10, 22, 15, 25, 11, 19, 14, 23, 12, 18].map(
            (height, index) => (
              <i
                key={index}
                style={{
                  height
                }}
              />
            )
          )}

        </div>


        {/* DURATION */}

        <span className="recorded-duration">
          {formatTime(duration)}
        </span>

      </div>


      {/* HIDDEN REAL AUDIO ELEMENT */}

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onEnded={handleEnded}
      />

    </div>
  );
}