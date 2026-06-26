import { Audio, AVPlaybackStatus } from "expo-av";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const MusicContext = createContext<any>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  // State definitions
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentFolderImage, setCurrentFolderImage] = useState<string | null>(
    null,
  );
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMusicModalVisible, setIsMusicModalVisible] = useState(false);

  // Flag para maiwasan ang maling pag-stop ng music sa init
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const isTransitioning = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Mag-o-stop lang kung wala nang user at tapos na ang initial load
      if (!user && isAuthInitialized) {
        stopAndUnload();
      }
      setIsAuthInitialized(true);
    });
    return () => unsubscribeAuth();
  }, [isAuthInitialized]);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSong(null);
    setCurrentFolderImage(null);
    setPosition(0);
    setDuration(0);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish && !status.isLooping) {
        if (isRepeat) {
          seekSong(0);
          soundRef.current?.playAsync();
        } else {
          handleNext();
        }
      }
    }
  };

  const playSong = async (
    song: any,
    newPlaylist: any[],
    index: number,
    folderImage?: string | null,
  ) => {
    if (isTransitioning.current) return;
    try {
      isTransitioning.current = true;
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.fileUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setCurrentSong(song);
      setPlaylist(newPlaylist);
      setCurrentIndex(index);
      setIsPlaying(true);
      if (folderImage !== undefined) setCurrentFolderImage(folderImage);
    } catch (error) {
      console.error("Error playing song:", error);
    } finally {
      isTransitioning.current = false;
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current || isTransitioning.current) return;
    if (isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const seekSong = async (millis: number) => {
    if (soundRef.current) await soundRef.current.setPositionAsync(millis);
  };

  const handleNext = () => {
    if (playlist.length === 0 || isTransitioning.current) return;
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * playlist.length)
      : (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex], playlist, nextIndex);
  };

  const handlePrev = () => {
    if (playlist.length === 0 || isTransitioning.current) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex], playlist, prevIndex);
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        position,
        duration,
        isShuffle,
        setIsShuffle,
        isRepeat,
        setIsRepeat,
        currentFolderImage,
        setCurrentFolderImage,
        isMusicModalVisible,
        setIsMusicModalVisible,
        playSong,
        togglePlay,
        seekSong,
        handleNext,
        handlePrev,
        stopAndUnload,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
