import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, CameraOff, ImageUp, ScanLine, X } from 'lucide-react';
import { extractStudentCodeFromQr } from './studentQr';
import './student-qr-scanner.css';

type QrDecoder = (pixels: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts: 'attemptBoth' }) => { data: string } | null;
declare global { interface Window { jsQR?: QrDecoder } }
let decoderPromise: Promise<QrDecoder> | null = null;
function loadDecoder(): Promise<QrDecoder> {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  if (!decoderPromise) {
    decoderPromise = new Promise<QrDecoder>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/vendor/jsQR-1.4.0.js';
      script.async = true;
      script.onload = () => window.jsQR ? resolve(window.jsQR) : reject(new Error('Không khởi tạo được bộ đọc mã QR.'));
      script.onerror = () => reject(new Error('Không tải được bộ đọc QR. Vui lòng thử lại.'));
      document.head.appendChild(script);
    }).catch(error => { decoderPromise = null; throw error; });
  }
  return decoderPromise;
}

function decodeFromCanvas(canvas: HTMLCanvasElement, source: CanvasImageSource, width: number, height: number, decoder: QrDecoder): string | null {
  const scale = Math.min(1, 1600 / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Trình duyệt không hỗ trợ đọc hình QR.');
  context.drawImage(source, 0, 0, w, h);
  const image = context.getImageData(0, 0, w, h);
  return decoder(image.data, w, h, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}

interface Props {
  onClose: () => void;
  /** Must reject if the backend cannot authenticate the scanned credential. */
  onVerifiedCode: (code: string) => Promise<void>;
}

export const StudentQrScanner: React.FC<Props> = ({ onClose, onVerifiedCode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const closedRef = useRef(false);
  const attemptRef = useRef(0);
  const pendingRef = useRef(false);
  const verifiedCodeRef = useRef(onVerifiedCode);
  const [cameraState, setCameraState] = useState<'starting' | 'ready' | 'stopped'>('starting');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { verifiedCodeRef.current = onVerifiedCode; }, [onVerifiedCode]);

  const stopCamera = useCallback(() => {
    attemptRef.current += 1;
    if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraState('stopped');
  }, []);

  const processDecoded = useCallback(async (text: string) => {
    if (pendingRef.current || closedRef.current) return;
    pendingRef.current = true;
    stopCamera();
    const code = extractStudentCodeFromQr(text, window.location.origin);
    if (!code) {
      setError('Mã QR không thuộc CHẠM ĐÀ NẴNG hoặc không đúng định dạng. Hãy dùng mã do thầy cô cấp.');
      pendingRef.current = false;
      return;
    }
    setError('');
    setChecking(true);
    try {
      // The QR string is only a candidate: server lookup is mandatory.
      await verifiedCodeRef.current(code);
    } catch (caught) {
      if (!closedRef.current) {
        const message = caught instanceof Error ? caught.message : '';
        setError(message || 'Mã không tồn tại, đã hết hiệu lực hoặc máy chủ chưa thể xác minh. Em hãy thử lại.');
      }
    } finally {
      if (!closedRef.current) setChecking(false);
      pendingRef.current = false;
    }
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    stopCamera();
    const attempt = attemptRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setError('Camera chỉ hoạt động trên trình duyệt HTTPS có hỗ trợ. Em có thể chọn ảnh QR bên dưới.');
      return;
    }
    setCameraState('starting');
    setError('');
    try {
      const decoder = await loadDecoder();
      if (closedRef.current || attempt !== attemptRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } });
      if (closedRef.current || attempt !== attemptRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return; }
      video.srcObject = stream;
      await video.play();
      if (closedRef.current || attempt !== attemptRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      setCameraState('ready');
      let lastFrame = 0;
      const frame = (time: number) => {
        if (closedRef.current || attempt !== attemptRef.current || pendingRef.current) return;
        if (time - lastFrame > 220 && video.readyState >= 2 && canvasRef.current && video.videoWidth && video.videoHeight) {
          lastFrame = time;
          try {
            const qr = decodeFromCanvas(canvasRef.current, video, video.videoWidth, video.videoHeight, decoder);
            if (qr) { void processDecoded(qr); return; }
          } catch { /* The next video frame may become readable. */ }
        }
        animationRef.current = requestAnimationFrame(frame);
      };
      animationRef.current = requestAnimationFrame(frame);
    } catch (caught) {
      if (closedRef.current || attempt !== attemptRef.current) return;
      stopCamera();
      const denied = caught instanceof DOMException && (caught.name === 'NotAllowedError' || caught.name === 'PermissionDeniedError');
      setError(denied ? 'Camera chưa được cấp quyền. Hãy bật quyền camera hoặc chọn ảnh QR đã lưu.' : 'Không mở được camera. Hãy thử lại hoặc tải ảnh QR từ thiết bị.');
    }
  }, [processDecoded, stopCamera]);

  useEffect(() => {
    closedRef.current = false;
    void startCamera();
    return () => {
      closedRef.current = true;
      attemptRef.current += 1;
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [startCamera]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || pendingRef.current) return;
    stopCamera();
    setError('');
    if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
      setError('Vui lòng chọn ảnh QR (JPG, PNG, HEIC hoặc WebP) nhỏ hơn 12 MB.');
      return;
    }
    setChecking(true);
    const src = URL.createObjectURL(file);
    try {
      const decoder = await loadDecoder();
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Không đọc được ảnh. Hãy chọn ảnh QR rõ nét hơn.'));
        img.src = src;
      });
      if (closedRef.current) return;
      const content = canvasRef.current && decodeFromCanvas(canvasRef.current, image, image.naturalWidth, image.naturalHeight, decoder);
      if (!content) { setError('Không tìm thấy mã QR trong ảnh. Hãy thử ảnh có QR rõ nét.'); return; }
      setChecking(false);
      await processDecoded(content);
    } catch (caught) {
      if (!closedRef.current) setError(caught instanceof Error ? caught.message : 'Không thể đọc ảnh QR này.');
    } finally {
      URL.revokeObjectURL(src);
      if (!closedRef.current) setChecking(false);
    }
  };

  return createPortal(
    <div className="cham-qr-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
      <section role="dialog" aria-modal="true" aria-label="Quét mã QR học sinh" className="cham-qr-dialog">
        <header className="cham-qr-header"><div><ScanLine size={23}/><h2>Quét mã QR học sinh</h2></div><button type="button" onClick={onClose} aria-label="Đóng quét QR"><X size={22}/></button></header>
        <p className="cham-qr-instructions">Đưa mã QR do thầy cô cấp vào khung hoặc chọn ảnh mã QR đã lưu.</p>
        <div className="cham-qr-camera">
          <video ref={videoRef} playsInline muted autoPlay aria-label="Camera quét mã QR" />
          <span className="cham-qr-reticle" aria-hidden="true" />
          {cameraState !== 'ready' && <div className="cham-qr-camera-status"><CameraOff size={24}/>{cameraState==='starting'?'Đang mở camera…':'Camera đang tắt'}</div>}
        </div>
        <canvas ref={canvasRef} className="cham-qr-hidden-canvas" aria-hidden="true" />
        {error && <p className="cham-qr-error" role="alert">{error}</p>}
        {checking && <p className="cham-qr-checking" role="status">Đang kiểm tra mã với hệ thống…</p>}
        <div className="cham-qr-actions">
          <button type="button" disabled={checking} onClick={()=>void startCamera()}><Camera size={19}/>{cameraState==='ready'?'Quét lại':'Bật camera'}</button>
          <label className={checking?'cham-qr-upload disabled':'cham-qr-upload'}><ImageUp size={19}/> Tải ảnh QR
            <input type="file" accept="image/*,.heic,.heif" disabled={checking} onChange={event=>void uploadImage(event)} aria-label="Chọn ảnh QR từ thiết bị" />
          </label>
        </div>
        <p className="cham-qr-privacy">Camera và ảnh chỉ được đọc trên thiết bị. Mã phải được máy chủ xác minh trước khi đăng nhập.</p>
      </section>
    </div>, document.body,
  );
};
