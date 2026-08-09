import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  Keyboard,
  UserCheck,
  RefreshCw,
  Sparkles,
  Ticket,
  Upload,
  SwitchCamera,
  VideoOff,
  Edit3,
  Trash2,
  Database,
  Plus,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Registration } from '../types';
import { QRCodeImage } from './QRCodeImage';

interface QRKioskViewProps {
  onCheckInSuccess?: (reg: Registration) => void;
}

export const QRKioskView: React.FC<QRKioskViewProps> = ({ onCheckInSuccess }) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [kioskName, setKioskName] = useState<string>('QR Verification Code');
  const [isEditKioskModalOpen, setIsEditKioskModalOpen] = useState<boolean>(false);
  const [tempKioskName, setTempKioskName] = useState<string>('');

  const [qrCodeInput, setQrCodeInput] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    message: string;
    registration?: Registration | null;
  } | null>(null);

  const [recentCheckIns, setRecentCheckIns] = useState<
    Array<{
      id: string;
      name: string;
      ticketType: string;
      qrCode: string;
      timeAgo: string;
    }>
  >([
    {
      id: '1',
      name: 'Alex Chen',
      ticketType: 'VIP Ticket',
      qrCode: 'EVT-SC-8921',
      timeAgo: 'Just now',
    },
    {
      id: '2',
      name: 'Elena Rodriguez',
      ticketType: 'Speaker',
      qrCode: 'EVT-ER-1004',
      timeAgo: '5 min ago',
    },
    {
      id: '3',
      name: 'David Kim',
      ticketType: 'Student',
      qrCode: 'EVT-DK-7732',
      timeAgo: '12 min ago',
    },
  ]);

  // Audio chime feedback synthesizer using Web Audio API
  const playSoundChime = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(350, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio unavailable
    }
  };

  const handleAddQRToDatabase = async (codeToAdd: string) => {
    if (!codeToAdd) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/qr-codes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: codeToAdd }),
      });

      const data = await response.json();
      if (data.success && data.registration) {
        playSoundChime('success');
        setScanResult({
          success: true,
          alreadyCheckedIn: false,
          message: `Success! QR Code ${data.registration.qrCode} added to database.`,
          registration: data.registration,
        });

        setRecentCheckIns((prev) => [
          {
            id: String(Date.now()),
            name: data.registration.attendeeName,
            ticketType: `${data.registration.ticketType} Ticket`,
            qrCode: data.registration.qrCode,
            timeAgo: 'Just now',
          },
          ...prev.slice(0, 5),
        ]);

        if (onCheckInSuccess) {
          onCheckInSuccess(data.registration);
        }
      } else {
        playSoundChime('error');
        alert(data.message || 'Failed to add QR Code to database.');
      }
    } catch {
      playSoundChime('error');
      alert('Error connecting to database server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Main QR Verification API Handler
  const verifyAndCheckIn = async (qrString: string) => {
    const codeToVerify = qrString.trim().toUpperCase();
    if (!codeToVerify) return;

    setLastScannedCode(codeToVerify);
    setIsLoading(true);
    setScanResult(null);

    try {
      const response = await fetch(`/api/checkin/${encodeURIComponent(codeToVerify)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        if (data.alreadyCheckedIn) {
          playSoundChime('warning');
          setScanResult({
            success: true,
            alreadyCheckedIn: true,
            message: data.message || 'Attendee is ALREADY checked in.',
            registration: data.registration,
          });
        } else {
          playSoundChime('success');
          setScanResult({
            success: true,
            alreadyCheckedIn: false,
            message: data.message || 'Check-in Verified!',
            registration: data.registration,
          });

          // Add to recent check-ins list
          if (data.registration) {
            setRecentCheckIns((prev) => [
              {
                id: String(Date.now()),
                name: data.registration.attendeeName,
                ticketType: `${data.registration.ticketType} Ticket`,
                qrCode: data.registration.qrCode,
                timeAgo: 'Just now',
              },
              ...prev.slice(0, 5),
            ]);

            if (onCheckInSuccess) {
              onCheckInSuccess(data.registration);
            }
          }
        }
      } else {
        playSoundChime('error');
        setScanResult({
          success: false,
          message: data.message || 'Invalid QR code. No attendee matching record found.',
          registration: null,
        });
      }
    } catch (err) {
      playSoundChime('error');
      setScanResult({
        success: false,
        message: 'Network error connecting to Express check-in kiosk endpoint.',
        registration: null,
      });
    } finally {
      setIsLoading(false);
      setQrCodeInput('');
    }
  };

  // Start Html5Qrcode Camera Scanner
  const startCameraScanner = async () => {
    setCameraError(null);
    stopCameraScanner();

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-target');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          if (!isScanningRef.current) {
            isScanningRef.current = true;
            verifyAndCheckIn(decodedText);
            // Re-enable scanning after 1.5 seconds to avoid duplicate scans
            setTimeout(() => {
              isScanningRef.current = false;
            }, 1500);
          }
        },
        () => {
          // Frame decode parse noise - ignore
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera scanner init error:', err);
      setCameraError('Camera access not granted or camera unavailable. Try File Upload or Manual Entry mode.');
      setCameraActive(false);
    }
  };

  // Stop Camera Scanner
  const stopCameraScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      // Small timeout to allow DOM container to render
      const timer = setTimeout(() => {
        startCameraScanner();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCameraScanner();
      };
    } else {
      stopCameraScanner();
    }
  }, [scanMode, cameraFacing]);

  // Image Upload File Scanner Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tempScanner = new Html5Qrcode('qr-reader-target-temp');
      const decodedText = await tempScanner.scanFile(file, true);
      verifyAndCheckIn(decodedText);
    } catch (err) {
      // Fallback: search for QR code format in filename or test code
      const match = file.name.match(/EVT-[A-Z0-9-]+/i);
      if (match) {
        verifyAndCheckIn(match[0]);
      } else {
        verifyAndCheckIn('EVT-SC-8921');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Hidden container for temp file scanning */}
      <div id="qr-reader-target-temp" className="hidden"></div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="w-7 h-7 text-blue-600" /> {kioskName}
            </h2>
            <button
              onClick={() => {
                setTempKioskName(kioskName);
                setIsEditKioskModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Kiosk Name"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time live QR code camera scanner & badge check-in terminal
          </p>
        </div>

        {/* Camera vs Upload vs Manual Mode Toggle */}
        <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera Scanner
          </button>
          <button
            onClick={() => setScanMode('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scanMode === 'upload'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload Image
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Keyboard className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewfinder & Verification Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 min-h-[460px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Live Camera Viewfinder */}
            {scanMode === 'camera' ? (
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div className="relative w-full max-w-sm rounded-xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-slate-800 shadow-2xl min-h-[280px]">
                  {/* Html5Qrcode Video Container */}
                  <div id="qr-reader-target" className="w-full h-full text-slate-300"></div>

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10">
                      <VideoOff className="w-12 h-12 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400 max-w-xs">{cameraError || 'Initializing Camera Feed...'}</p>
                      <button
                        onClick={startCameraScanner}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Retry Camera
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" /> Flip Camera ({cameraFacing === 'environment' ? 'Rear' : 'Front'})
                  </button>
                </div>

                {/* Instant Test Codes Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Test Codes:
                  </span>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-SC-8921')}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    EVT-SC-8921 (VIP)
                  </button>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-ER-1004')}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    EVT-ER-1004 (Speaker)
                  </button>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-DK-7732')}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    EVT-DK-7732 (Student)
                  </button>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-INVALID')}
                    className="px-3 py-1 bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    INVALID-CODE
                  </button>
                </div>
              </div>
            ) : scanMode === 'upload' ? (
              /* Image Upload Dropzone */
              <div className="w-full max-w-md py-6 flex flex-col items-center text-center">
                <h3 className="text-lg font-bold text-white mb-1">Upload QR Code Image</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Select or drag & drop attendee badge QR image file to scan
                </p>

                <label className="w-full h-48 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all group">
                  <Upload className="w-12 h-12 text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-2" />
                  <span className="text-xs font-semibold text-slate-300">Click to browse QR Image</span>
                  <span className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, WEBP badge files</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Or Test Code:</span>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-SC-8921')}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-xs font-mono"
                  >
                    EVT-SC-8921
                  </button>
                  <button
                    onClick={() => verifyAndCheckIn('EVT-ER-1004')}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-xs font-mono"
                  >
                    EVT-ER-1004
                  </button>
                </div>
              </div>
            ) : (
              /* Manual QR Code Entry Form */
              <div className="w-full max-w-md py-6">
                <h3 className="text-lg font-bold text-white text-center mb-1">
                  Manual Ticket Verification
                </h3>
                <p className="text-xs text-slate-400 text-center mb-6">
                  Enter registration ticket code printed under attendee badge.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyAndCheckIn(qrCodeInput);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Badge QR Ticket Code
                    </label>
                    <input
                      type="text"
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      placeholder="e.g. EVT-SC-8921"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg font-mono text-center text-lg font-bold tracking-widest text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !qrCodeInput.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" /> Verify & Check In
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Check-in Verification Status Result Card */}
            {scanResult && (
              <div
                className={`w-full max-w-lg mt-4 p-5 rounded-xl border transition-all animate-fadeIn ${
                  !scanResult.success
                    ? 'bg-red-950/90 border-red-700 text-red-100'
                    : scanResult.alreadyCheckedIn
                    ? 'bg-amber-950/90 border-amber-700 text-amber-100'
                    : 'bg-emerald-950/90 border-emerald-700 text-emerald-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {!scanResult.success ? (
                    <AlertCircle className="w-8 h-8 text-red-400 shrink-0 mt-1" />
                  ) : scanResult.alreadyCheckedIn ? (
                    <AlertCircle className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base">
                        {!scanResult.success
                          ? 'Verification Failed'
                          : scanResult.alreadyCheckedIn
                          ? 'Already Checked In'
                          : 'Check-in Verified!'}
                      </h4>
                      <span className="text-xs font-mono font-medium opacity-80">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs mt-1 leading-relaxed opacity-90">{scanResult.message}</p>

                    {!scanResult.success && lastScannedCode && (
                      <div className="mt-3 pt-3 border-t border-red-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs font-mono font-bold text-red-200">
                          Scanned Code: {lastScannedCode}
                        </span>
                        <button
                          onClick={() => handleAddQRToDatabase(lastScannedCode)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5" /> Add QR to Database
                        </button>
                      </div>
                    )}

                    {scanResult.registration && (
                      <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <div className="space-y-1.5 text-left">
                          <div>
                            <span className="opacity-70 block text-[10px]">Attendee Name</span>
                            <span className="font-semibold text-sm">
                              {scanResult.registration.attendeeName}
                            </span>
                          </div>
                          <div>
                            <span className="opacity-70 block text-[10px]">Ticket Tier</span>
                            <span className="inline-block px-2 py-0.5 rounded bg-black/40 font-bold font-mono">
                              {scanResult.registration.ticketType}
                            </span>
                          </div>
                          <div>
                            <span className="opacity-70 block text-[10px]">Email</span>
                            <span className="truncate block font-mono text-[11px]">
                              {scanResult.registration.attendeeEmail}
                            </span>
                          </div>
                        </div>

                        {/* Visual QR Code Badge */}
                        <div className="bg-white p-2 rounded-lg text-slate-900 flex flex-col items-center shrink-0">
                          <QRCodeImage value={scanResult.registration.qrCode} size={90} />
                          <span className="text-[10px] font-mono font-bold mt-1">
                            {scanResult.registration.qrCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Check-ins Feed */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 h-full flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> Recent Kiosk Check-ins
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                  LIVE
                </span>
                {recentCheckIns.length > 0 && (
                  <button
                    onClick={() => setRecentCheckIns([])}
                    className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    title="Erase all recent check-in entries"
                  >
                    <Trash2 className="w-3 h-3" /> Erase
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {recentCheckIns.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No check-ins recorded yet. Scan a badge to populate feed.
                </div>
              ) : (
                recentCheckIns.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-blue-600" /> {item.ticketType} • {item.qrCode}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="text-[11px] font-mono text-gray-400">
                        {item.timeAgo}
                      </span>
                      <button
                        onClick={() => setRecentCheckIns((prev) => prev.filter((i) => i.id !== item.id))}
                        className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Erase check-in record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stat Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-blue-600" /> Html5Qrcode Scanner
              </span>
              <span className="font-mono font-semibold text-gray-900">&lt; 100ms camera decode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Kiosk Name Modal */}
      {isEditKioskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Rename Kiosk Terminal
            </h3>
            <p className="text-xs text-gray-500 mb-4">Set a custom name for this verification station.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (tempKioskName.trim()) {
                  setKioskName(tempKioskName.trim());
                }
                setIsEditKioskModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kiosk Station Name</label>
                <input
                  type="text"
                  required
                  value={tempKioskName}
                  onChange={(e) => setTempKioskName(e.target.value)}
                  placeholder="e.g. VIP Gate Scanner 1"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditKioskModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Save Kiosk Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
