import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  QrCode, 
  Barcode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeftRight, 
  AlertTriangle, 
  Eye, 
  Wrench, 
  Volume2, 
  VolumeX,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { Asset } from '../../types';

interface ScannerViewProps {
  onSelectAsset: (asset: Asset) => void;
  onBorrowAsset: (asset: Asset) => void;
  onReturnAsset?: (asset: Asset) => void;
  onReportIssue: (asset: Asset) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onSelectAsset,
  onBorrowAsset,
  onReportIssue,
}) => {
  const { assets } = useAssets();

  const [manualInput, setManualInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play beep sound on scan
  const playScanBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext may require user gesture
    }
  };

  const handleLookup = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const found = assets.find(
      (a) =>
        a.assetTag.toLowerCase() === q ||
        a.serialNumber.toLowerCase() === q ||
        a.id.toLowerCase() === q ||
        a.name.toLowerCase().includes(q)
    );

    if (found) {
      setScannedAsset(found);
      playScanBeep();
      setScanSuccessAnim(true);
      setTimeout(() => setScanSuccessAnim(false), 800);
    } else {
      setScannedAsset(null);
    }
  };

  // Start real camera stream
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access unavailable or blocked in this environment. You can use manual tag lookup or simulator presets below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <span>Barcode & QR Code Scanner</span>
          </h2>
          <p className="text-xs text-slate-400">
            Scan asset tags, serial barcodes or look up hardware directly
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-[#121c32] hover:bg-[#182645] border border-[#213154] text-slate-400 hover:text-white transition-colors"
          title={soundEnabled ? 'Mute scan beep' : 'Enable scan beep'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Interactive Camera / Viewfinder */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl flex flex-col items-center justify-between">
          <div className="w-full relative aspect-square max-w-sm rounded-xl overflow-hidden bg-black/90 border-2 border-[#1e2d4d] flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Camera Viewfinder Ready</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Click below to activate device optical sensor for scanning physical labels.
                </p>
              </div>
            )}

            {/* Viewfinder crosshairs & laser animation */}
            <div className="absolute inset-8 pointer-events-none border border-blue-500/40 rounded-xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />

              {/* Animated laser scanline */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-bounce" />
            </div>

            {scanSuccessAnim && (
              <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center backdrop-blur-[2px] transition-all">
                <CheckCircle2 className="w-12 h-12 text-white animate-scale" />
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] text-center w-full">
              {cameraError}
            </div>
          )}

          <div className="w-full mt-4 flex items-center justify-center space-x-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-600/30 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start Video Scanner</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Right: Manual Input & Barcode Simulator Presets */}
        <div className="space-y-4">
          {/* Manual Input Search */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Search className="w-4 h-4 text-blue-400" />
              <span>Direct Barcode / Serial Lookup</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualInput);
              }}
              className="space-y-2"
            >
              <div className="relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. AST-00101 or C02G9012MD6T"
                  className="w-full px-3.5 py-2.5 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#142240] hover:bg-[#1a2d54] border border-[#233863] text-blue-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Identify Asset Record</span>
              </button>
            </form>
          </div>

          {/* Barcode Simulator Presets */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-purple-400" />
                <span>Simulate Hardware Scan</span>
              </h3>
              <span className="text-[10px] text-slate-500">Quick Test</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Click any simulated asset barcode below to test instantaneous retrieval:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {assets.slice(0, 6).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    setManualInput(asset.assetTag);
                    handleLookup(asset.assetTag);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#090e1a] hover:bg-[#15223c] border border-[#1a2642] hover:border-blue-500/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {asset.assetTag}
                      </span>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-blue-300 truncate">
                        {asset.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      S/N: {asset.serialNumber}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                    asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                    asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300' :
                    asset.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {asset.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scanned Result Banner / Card */}
      {scannedAsset ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111c34] to-[#0c1425] border-2 border-blue-500/50 shadow-2xl shadow-blue-500/15 space-y-4 animate-scale">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2c4d]">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {scannedAsset.assetTag}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    scannedAsset.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                    scannedAsset.status === 'borrowed' ? 'bg-purple-500/20 text-purple-300' :
                    scannedAsset.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {scannedAsset.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{scannedAsset.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  S/N: {scannedAsset.serialNumber} • Location: {scannedAsset.location}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Valuation</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                ${scannedAsset.purchaseCost ? scannedAsset.purchaseCost.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onSelectAsset(scannedAsset)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Asset Record</span>
            </button>

            {scannedAsset.status === 'available' && (
              <button
                onClick={() => onBorrowAsset(scannedAsset)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Borrow / Checkout Asset</span>
              </button>
            )}

            <button
              onClick={() => onReportIssue(scannedAsset)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-amber-600/30 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setScannedAsset(null)}
              className="px-4 py-2 rounded-xl bg-[#142038] hover:bg-[#1a2c4e] text-slate-300 text-xs font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      ) : manualInput && (
        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] text-center text-slate-400 text-xs">
          No asset matching "{manualInput}" found in database. Try verifying the serial number or asset tag.
        </div>
      )}
    </div>
  );
};
