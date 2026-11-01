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
import { useBear, useVoiceUrl } from "../BearConnection";
import { toBearWav } from "../lib/audio";
import { formatActivityTime, formatVoiceTime } from "../lib/hardware";

export default function Messages({ setPage }) {
  const { state, request } = useBear();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const sentVoices = state?.messages || [];
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const stopTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const uploadRef = useRef(null);

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      setBusy(true);
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    clearInterval(timerRef.current);
    clearTimeout(stopTimerRef.current);
  };

  const startRecording = async () => {
    if (busy) return;
    setBusy(true);
    setPermissionError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Microphone recording needs HTTPS or localhost in a supported browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      uploadRef.current = null;
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = event => {
        setPermissionError(event.error?.message || "Recording failed.");
        stopRecording();
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        if (mountedRef.current) {
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setBusy(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(value => value + 1), 1000);
      stopTimerRef.current = setTimeout(stopRecording, 30000);
    } catch (error) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (mountedRef.current) setPermissionError(error.message);
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordTime(0);
    uploadRef.current = null;
  };

  const sendRecording = async () => {
    if (!audioBlob || busy) return;
    setBusy(true);
    setPermissionError("");
    try {
      if (!uploadRef.current) uploadRef.current = { ...await toBearWav(audioBlob), id: crypto.randomUUID() };
      const upload = uploadRef.current;
      await request("/api/messages?from=parent", {
        method: "POST",
        headers: { "Content-Type": "audio/wav", "X-Message-Id": upload.id },
        body: upload.blob,
        signal: AbortSignal.timeout(15000)
      });
      if (mountedRef.current) deleteRecording();
    } catch (error) {
      if (mountedRef.current) setPermissionError(`${error.message} Your recording is kept here for retry.`);
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
      clearTimeout(stopTimerRef.current);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.onerror = null;
        if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const formatTime = formatVoiceTime;

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
            ALL NEW RECORDINGS
            ================================================= */}

        {sentVoices.length === 0 && (
          <div className="messages-empty">
            <span>🎙️</span>
            <h3>No voice messages yet</h3>
            <p>Your recorded replies will appear here after you send them.</p>
          </div>
        )}

        {sentVoices.map((voice, index) => (
          <RecordedVoice
            key={voice.id}
            audioUrl={voice.url}
            duration={voice.duration}
            number={index + 1}
            from={voice.from}
            at={voice.at}
            formatTime={formatTime}
          />
        ))}


        {/* =================================================
            ERROR
            ================================================= */}

        {permissionError && (
          <div className="record-error" role="alert">
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
            data-tutorial="record-reply"
            disabled={busy}
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
                disabled={busy}
                aria-label="Discard recording"
                onClick={deleteRecording}
              >
                <Trash2 size={18} />
              </button>


              <button
                className="send-recording"
                disabled={busy}
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
   REAL RECORDED VOICE MESSAGE
   ========================================================= */

function RecordedVoice({
  audioUrl,
  duration,
  number,
  from,
  at,
  formatTime
}) {

  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const { url, error } = useVoiceUrl(audioUrl);


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
      setPlaybackError(error.message);
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
    <div className={`voice ${from === "parent" ? "mine" : ""} recorded-voice`}>

      <div className="voice-top">

        <strong>
          {from === "parent" ? "You" : "Your child"}
        </strong>

        <span>
          {formatActivityTime(at)}
        </span>

      </div>


      <div className="recorded-audio-row">

        {/* CUSTOM PLAY BUTTON */}

        <button
          className="recorded-play"
          disabled={!url}
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
        src={url || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaybackError("This voice message could not be played.")}
        onEnded={handleEnded}
      />
      {(error || playbackError) && <div className="record-error" role="alert">{error || playbackError}</div>}

    </div>
  );
}
