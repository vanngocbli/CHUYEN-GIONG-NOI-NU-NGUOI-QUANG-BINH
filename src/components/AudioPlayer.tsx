import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Check,
  Music2,
  FastForward,
} from "lucide-react";

interface AudioPlayerProps {
  audioBase64: string;
  durationSeconds?: number;
  label?: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  audioBase64,
  durationSeconds,
  label = "Bản đọc giọng Nữ Quảng Bình",
  autoPlay = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [downloaded, setDownloaded] = useState(false);

  const audioSrc = audioBase64.startsWith("data:")
    ? audioBase64
    : `data:audio/wav;base64,${audioBase64}`;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log("Auto-play prevented by browser policy:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [audioBase64, autoPlay]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error("Playback restart error:", err));
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (dur && !isNaN(dur) && isFinite(dur)) {
      setTotalDuration(dur);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleCycleSpeed = () => {
    const speeds = [0.8, 1, 1.2, 1.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = audioSrc;
      link.download = `giong-nu-quang-binh-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="audio-player-container"
      className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-xs transition-all duration-200"
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Title bar with status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isPlaying
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 leading-tight">
              {label}
            </h4>
            <p className="text-xs text-stone-500">
              Chất giọng Bắc Trung Bộ (Quảng Bình) • Chuẩn âm thanh 24kHz
            </p>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2">
          <button
            id="download-audio-btn"
            onClick={handleDownload}
            title="Tải file âm thanh (.wav) về máy"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã tải</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Tải .WAV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualizer Waveform Bar */}
      <div className="flex items-center justify-center gap-1 my-3.5 py-1.5 px-3 bg-amber-100/50 rounded-xl h-9">
        {Array.from({ length: 28 }).map((_, i) => {
          const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
          const barRatio = i / 28;
          const isPassed = barRatio <= progress;
          // Calculate dynamic height
          const baseHeight = ((i * 7) % 18) + 8;
          const dynamicHeight = isPlaying
            ? Math.max(6, Math.min(26, baseHeight * (0.6 + Math.sin(currentTime * 5 + i * 0.8) * 0.4)))
            : baseHeight * 0.5;

          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isPassed
                  ? "bg-amber-600"
                  : isPlaying
                  ? "bg-amber-300"
                  : "bg-stone-300"
              }`}
              style={{ height: `${dynamicHeight}px` }}
            />
          );
        })}
      </div>

      {/* Scrub bar & Time stamps */}
      <div className="space-y-1.5">
        <input
          id="audio-scrub-slider"
          type="range"
          min="0"
          max={totalDuration || 1}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />
        <div className="flex justify-between text-xs font-mono text-stone-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-amber-200/60">
        <div className="flex items-center gap-2">
          {/* Main Play/Pause */}
          <button
            id="play-pause-btn"
            onClick={handleTogglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Replay */}
          <button
            id="replay-btn"
            onClick={handleRestart}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title="Đọc lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Preset Cycle */}
          <button
            id="speed-toggle-btn"
            onClick={handleCycleSpeed}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
            title="Tốc độ đọc"
          >
            <FastForward className="w-3 h-3 text-stone-500" />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            id="mute-toggle-btn"
            onClick={handleToggleMute}
            className="text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title={isMuted ? "Bật âm" : "Tắt âm"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-18 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            title="Âm lượng"
          />
        </div>
      </div>
    </div>
  );
}
