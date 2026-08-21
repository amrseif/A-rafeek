import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Headphones,
  ChevronDown,
  X,
  Sliders,
  Sparkles,
  Check,
  Music,
  Maximize2,
} from 'lucide-react';
import { sounds, SOUND_TRACKS, FocusSoundTrack } from '../utils/audio';

interface Props {
  compact?: boolean;
}

export const FocusAudioPlayer: React.FC<Props> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(sounds.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState<FocusSoundTrack>(sounds.getTrack());
  const [volume, setVolume] = useState<number>(sounds.getVolume());
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.6);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = sounds.subscribe(() => {
      setIsPlaying(sounds.getIsPlaying());
      setCurrentTrack(sounds.getTrack());
      setVolume(sounds.getVolume());
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await sounds.togglePlay();
  };

  const handleSelectTrack = async (trackId: FocusSoundTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await sounds.togglePlay(trackId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    sounds.setVolume(val);
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      sounds.setVolume(prevVolume || 0.6);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      sounds.setVolume(0);
    }
  };

  const currentTrackObj =
    SOUND_TRACKS.find((t) => t.id === currentTrack) || SOUND_TRACKS[0];

  return (
    <>
      {compact ? (
        <div id="top-navbar-sound-control" className="relative flex items-center">
          {/* Main Compact Button Bar */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 shadow-sm">
            {/* Quick Play/Pause Button */}
            <button
              type="button"
              id="navbar-quick-sound-play-btn"
              onClick={handleTogglePlay}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30 ring-1 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title={isPlaying ? 'إيقاف الصوت مؤقتاً' : 'تشغيل صوت التركيز'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {/* Sound Dropdown Toggle */}
            <button
              type="button"
              id="focus-sound-picker-compact-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                showDropdown
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-400/60 ring-1 ring-cyan-400/40'
                  : isPlaying
                  ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/30'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
              title="لوحة التحكم السريعة في أصوات التركيز"
            >
              <span className="text-sm leading-none">{currentTrackObj.icon}</span>
              <span className="hidden sm:inline truncate max-w-[100px] text-right font-sans">
                {currentTrackObj.name.split('(')[0].trim()}
              </span>
              <span className="sm:hidden font-sans">صوت</span>

              {isPlaying ? (
                <span className="flex items-center gap-0.5 mr-0.5">
                  <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce" />
                </span>
              ) : (
                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${showDropdown ? 'rotate-180 text-cyan-400' : ''}`} />
              )}
            </button>
          </div>

          {/* TOP POPUP DROPDOWN FOR RAPID AUDIO CONTROL */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setShowDropdown(false)}
              />
              <div
                id="navbar-sound-dropdown-menu"
                className="absolute left-0 sm:right-auto sm:left-0 top-full mt-2.5 w-80 sm:w-96 rounded-3xl bg-[#0B1120] border-2 border-cyan-400/50 shadow-2xl shadow-cyan-950/80 p-4 sm:p-5 z-[70] animate-in fade-in zoom-in-95 duration-150 text-right"
              >
                {/* Header with status */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>أصوات عزل المشتتات والتركيز</span>
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                        <span className={isPlaying ? 'text-emerald-300 font-bold' : 'text-white/40'}>
                          {isPlaying ? 'جاري التشغيل الآن' : 'متوقف مؤقتاً'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] text-cyan-300 border border-white/10 transition-colors"
                    title="فتح الاستوديو الصوتي الموسع"
                  >
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">تكبير</span>
                  </button>
                </div>

                {/* Main Play & Volume Slider Row */}
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 mb-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-300 transition-colors"
                        title={isMuted ? 'إلغاء الكتم' : 'كتم'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>
                      <span className="text-[11px] font-mono text-white/60">مستوى الصوت:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/20 rounded-lg"
                    title="التحكم في شدة الصوت"
                  />
                </div>

                {/* Sound Selection Grid */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                  {SOUND_TRACKS.map((track) => {
                    const isSelected = currentTrack === track.id;
                    const isThisPlaying = isSelected && isPlaying;

                    return (
                      <button
                        key={track.id}
                        type="button"
                        id={`dropdown-sound-option-${track.id}`}
                        onClick={(e) => handleSelectTrack(track.id, e)}
                        className={`w-full text-right p-2.5 rounded-2xl text-xs transition-all flex items-center justify-between gap-2 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl leading-none shrink-0">{track.icon}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white truncate">
                                {track.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/50 font-sans block truncate">
                              {track.description}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isThisPlaying ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              يعمل
                            </span>
                          ) : isSelected ? (
                            <Check className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/5">
                              {track.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Quick Play / Pause Button */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      isPlaying
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                        : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:opacity-95 text-black shadow-cyan-400/20'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>إيقاف الصوت مؤقتاً</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>تشغيل: {currentTrackObj.name.split('(')[0].trim()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          id="focus-audio-main-strip"
          className="bg-gradient-to-r from-[#0d1424] via-[#0B0F17] to-[#0d1424] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Track Info Preview */}
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-12 h-12 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0 transition-transform active:scale-95"
                title="تغيير الصوت"
              >
                {currentTrackObj.icon}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {currentTrackObj.category}
                  </span>
                  <span className="text-xs text-white/50 font-sans">
                    أصوات المذاكرة وعزل التشتت
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
                  <span>{currentTrackObj.name}</span>
                </h4>
                <p className="text-xs text-white/60 hidden md:block max-w-lg mt-0.5">
                  {currentTrackObj.description}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={(e) => handleToggleMute(e)}
                  className="text-white/60 hover:text-cyan-300 transition-colors"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  title="مستوى الصوت"
                />
              </div>

              {/* Open Modal Button */}
              <button
                type="button"
                id="open-sound-library-modal-btn"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>اختيار وتغيير الصوت</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                id="toggle-focus-sound-main-btn"
                onClick={(e) => handleTogglePlay(e)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 font-extrabold'
                    : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:opacity-95 text-black shadow-cyan-500/25'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف الصوت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>تشغيل الصوت</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP FULLSCREEN MODAL FOR SOUND SELECTION (PORTAL ATTACHED TO BODY) */}
      {showModal && mounted && createPortal(
        <SoundSelectionModal
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onClose={() => setShowModal(false)}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={handleTogglePlay}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
        />,
        document.body
      )}
    </>
  );
};

interface ModalProps {
  currentTrack: FocusSoundTrack;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onClose: () => void;
  onSelectTrack: (track: FocusSoundTrack, e?: React.MouseEvent) => Promise<void>;
  onTogglePlay: (e?: React.MouseEvent) => Promise<void>;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: (e?: React.MouseEvent) => void;
}

const SoundSelectionModal: React.FC<ModalProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  onClose,
  onSelectTrack,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
}) => {
  return (
    <div
      id="sound-selection-modal-overlay"
      className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        id="sound-selection-modal-card"
        className="relative bg-[#0B1120] border-2 border-cyan-400/60 w-full max-w-2xl rounded-3xl shadow-2xl shadow-cyan-950/80 p-5 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200 text-right my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>استوديو أصوات التركيز والمذاكرة</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  نقاء عالي
                </span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                اختر التردد الصوتي المناسب لمساعدتك على الحفظ، الفهم، أو عزل أي مشتتات خارجية
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-sound-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 max-h-[55vh] overflow-y-auto pl-1 pr-1 custom-scrollbar">
          {SOUND_TRACKS.map((track) => {
            const isSelected = currentTrack === track.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <button
                type="button"
                key={track.id}
                id={`sound-track-card-${track.id}`}
                onClick={(e) => onSelectTrack(track.id, e)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-indigo-950/90 border-cyan-400 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-950/80'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-3xl">{track.icon}</span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold'
                          : 'bg-white/5 text-white/70 border-white/10'
                      }`}
                    >
                      {track.badge}
                    </span>
                  </div>

                  <div className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                    {track.name}
                  </div>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-white/40">
                    {track.category}
                  </span>

                  {isThisPlaying ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      جاري التشغيل الآن
                    </span>
                  ) : isSelected ? (
                    <span className="text-cyan-300 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      الصوت المحدد
                    </span>
                  ) : (
                    <span className="text-white/50 group-hover:text-white font-medium">
                      اضغط للتجربة والتشغيل ←
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Bottom Playback & Volume Control Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => onToggleMute(e)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 transition-colors"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 font-mono">درجة الصوت:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                className="w-24 sm:w-32 accent-cyan-400 cursor-pointer h-2 bg-white/20 rounded-lg"
              />
              <span className="text-[11px] font-mono text-cyan-400 font-bold w-9">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => onTogglePlay(e)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-black'
                  : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:opacity-95 text-black'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف الصوت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل الصوت المحدد</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

