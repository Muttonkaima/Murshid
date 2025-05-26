import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaWaveSquare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export default function AudioPlayer({ audioUrl, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Animation variants for the play/pause button
  const buttonVariants = {
    play: { scale: 1 },
    pause: { 
      scale: [1, 1.1, 1],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const
      } 
    }
  };

  // Wave animation variants for the play button
  const waveButtonVariants = {
    play: {
      scale: 1,
      borderRadius: '9999px',
      width: '3rem',
      height: '3rem',
      transition: { duration: 0.3 }
    },
    wave: {
      scale: 1.1,
      borderRadius: '12px',
      width: '4rem',
      height: '3rem',
      transition: { 
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Wave bar variants
  const waveBarVariants = {
    hidden: { height: 4, y: 10 },
    visible: (i: number) => ({
      height: [4, 20, 4],
      y: [10, 0, 10],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.1,
        repeatType: 'reverse' as const,
        ease: 'easeInOut'
      }
    })
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <motion.button
        onClick={togglePlay}
        className="relative flex items-center justify-center bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 cursor-pointer border-2 border-[var(--primary-color)]/30 overflow-hidden"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        variants={waveButtonVariants}
        initial="play"
        animate={isPlaying ? 'wave' : 'play'}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div 
              key="wave"
              className="flex items-end justify-center space-x-1 px-2 h-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={waveBarVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-1 bg-current rounded-full"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="play-icon"
              className="w-5 h-5 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <FaPlay className="w-3 h-3 ml-0.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex items-center space-x-1">
        <button onClick={toggleMute} className="text-gray-600 hover:text-gray-800">
          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 accent-blue-500"
        />
      </div>
    </div>
  );
}
