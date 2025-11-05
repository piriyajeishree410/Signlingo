import { useEffect, useRef, useState } from "react";
import s from "./CameraPanel.module.css";

/**
 * Props:
 * - mode: 'letters' | 'gestures' | null
 *
 * This component:
 * - requests webcam
 * - shows live preview
 * - (optional) captures frames every 300ms and POSTs to /api/live/detect?mode=...
 *   To enable real requests, flip `SEND_TO_BACKEND` to true and ensure your
 *   Express proxy → FastAPI endpoint exists (same-origin; no CORS needed).
 */
const SEND_TO_BACKEND = true; // set to true when your backend is ready

export default function CameraPanel({ mode }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("—");
  const [conf, setConf] = useState(null);
  const [err, setErr] = useState("");

  // Start camera
  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setRunning(true);
      }
    } catch (e) {
      setErr(e.message || "Camera permission denied");
      setRunning(false);
    }
  };

  // Stop camera
  const stop = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      v.srcObject.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setRunning(false);
  };

  // Capture loop
  useEffect(() => {
    if (!running || !mode) return;
    let cancelled = false;
    const iv = setInterval(async () => {
      if (cancelled) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return;

      // draw smaller frame for bandwidth
      const w = 320;
      const h = Math.round((v.videoHeight / v.videoWidth) * w) || 240;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(v, 0, 0, w, h);
      const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.7));

      if (SEND_TO_BACKEND) {
        try {
          const fd = new FormData();
          fd.append("image", blob, "frame.jpg");
          const resp = await fetch(`/api/live/detect?mode=${mode}`, {
            method: "POST",
            body: fd,
          });
          const data = await resp.json();
          setLabel(data.label ?? "—");
          setConf(data.confidence ?? null);
        } catch {
          // keep UI alive even if backend is down
        }
      } else {
        // Demo: fake label while backend not ready
        setLabel(mode === "letters" ? "A" : "Hello");
        setConf(0.86);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [running, mode]);

  return (
    <div className={s.wrap}>
      <div className={s.videoWrap}>
        {!running ? (
          <div className={s.placeholder}>
            <p>Camera is off</p>
            <button className={s.primary} onClick={start} disabled={!mode}>
              {mode ? "Start Camera" : "Choose a Mode"}
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className={s.video} playsInline muted />
            <div className={s.overlay}>
              <div className={s.badge}>
                {mode === "letters" ? "A–Z Letters" : "Gestures"}
              </div>
              <div className={s.result}>
                <div className={s.label}>{label}</div>
                {conf != null && (
                  <div className={s.conf}>({Math.round(conf * 100)}%)</div>
                )}
              </div>
              <button className={s.stop} onClick={stop}>
                Stop
              </button>
            </div>
          </>
        )}
        {/* hidden capture canvas */}
        <canvas ref={canvasRef} className={s.hidden} />
      </div>

      {err && (
        <div className={s.err} role="alert">
          {err}
        </div>
      )}
    </div>
  );
}
