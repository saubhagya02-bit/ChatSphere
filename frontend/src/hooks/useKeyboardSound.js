import { useChatStore } from "../store/useChatStore";

const clickSnd = new Audio("/sounds/mouseClick.mp3");
const sentSnd = new Audio("/sounds/msgSentSound.mp3");
const recvSnd = new Audio("/sounds/msgSound.mp3");
clickSnd.preload = sentSnd.preload = recvSnd.preload = "auto";

function useKeyboardSound() {
  const { isSoundEnabled } = useChatStore();

  const play = (snd) => {
    if (!isSoundEnabled) return;
    snd.currentTime = 0;
    snd.play().catch(() => {});
  };

  return {
    playClick: () => play(clickSnd),
    playMessageSent: () => play(sentSnd),
    playMessageReceive: () => play(recvSnd),
  };
}

export default useKeyboardSound;
