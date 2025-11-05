import { useEffect, useRef, useState } from "react";
import s from "./LivePracticePage.module.css";

const API_BASE = "/api/live"; // proxied to FastAPI (see vite.config.js)

export default function LivePractice() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("letters"); // "letters" | "gestures"
  const [running, setRunning] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [label, setLabel] = useState("-");
  const [conf, setConf] = useState(0);
  const [err, setErr] = useState("");

  // Start camera preview
  async function startCamera() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      const v = videoRef.current;
      v.srcObject = stream;
      // Safari/iOS needs playsInline+muted+play()
      await v.play();
      setHasStream(true);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  }

  // Stop camera
  function stopCamera() {
    setRunning(false);
    setHasStream(false);
    const v = videoRef.current;
    const s = v.srcObject;
    if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
    v.srcObject = null;
  }

  // One frame -> blob
  function frameToBlob(video, canvas) {
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8)
    );
  }

  // Upload frame to /detect
  async function detectFrame(blob, mode) {
    const fd = new FormData();
    fd.append("image", blob, "frame.jpg");
    const res = await fetch(`${API_BASE}/detect?mode=${mode}`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Loop while `running`
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let raf = 0;
    const v = videoRef.current;
    const c = canvasRef.current;

    async function tick() {
      // throttle: only send next when previous finished
      if (running && hasStream && v && !inFlight) {
        inFlight = true;
        try {
          const blob = await frameToBlob(v, c);
          const data = await detectFrame(blob, mode);
          if (!cancelled) {
            setLabel(data.label ?? "-");
            setConf(data.confidence ?? 0);
          }
        } catch (e) {
          if (!cancelled) setErr(e?.message || String(e));
        } finally {
          inFlight = false;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    if (running) {
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [running, hasStream, mode]);

  return (
    <div className={s.wrap}>
      <div className={s.left}>
        <div className={s.card}>
          <div className={s.preview}>
            <video
              ref={videoRef}
              className={s.video}
              autoPlay
              playsInline
              muted
            />
            {!hasStream && (
              <div className={s.overlayHelp}>
                Click <b>Start Camera</b> to preview your webcam here.
              </div>
            )}
          </div>
          <div className={s.controls}>
            {!hasStream ? (
              <button className={s.btnPrimary} onClick={startCamera}>
                Start Camera
              </button>
            ) : (
              <button className={s.btn} onClick={stopCamera}>
                Stop Camera
              </button>
            )}
            <select
              className={s.select}
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={running}
            >
              <option value="letters">ASL Letters</option>
              <option value="gestures">ASL Gestures</option>
            </select>
            <button
              className={running ? s.btn : s.btnPrimary}
              onClick={() => setRunning((v) => !v)}
              disabled={!hasStream}
            >
              {running ? "Pause Detection" : "Start Detection"}
            </button>
          </div>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.card}>
          <h3 className={s.h3}>Prediction</h3>
          <div className={s.predRow}>
            <div className={s.predLabel}>{label}</div>
            <div className={s.predConf}>{(conf * 100).toFixed(1)}%</div>
          </div>
          {err && <div className={s.err}>⚠ {err}</div>}
        </div>
        <div className={s.card}>
          <h3 className={s.h3}>Tips</h3>
          <ul className={s.list}>
            <li>Good lighting and centered hand improve accuracy.</li>
            <li>Keep the hand steady for a moment.</li>
            <li>Use “ASL Gestures” mode only if that model is loaded.</li>
          </ul>
        </div>
      </div>

      {/* Offscreen canvas for snapshots */}
      <canvas ref={canvasRef} className={s.hidden} />
    </div>
  );
}
