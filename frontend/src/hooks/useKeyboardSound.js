const clickSound = new Audio("/sounds/mouseClick.mp3");
const msgReceiveSound = new Audio("/sounds/msgSound.mp3");
const msgSentSound = new Audio("/sounds/msgSentSound.mp3");

clickSound.preload = "auto";
msgReceiveSound.preload = "auto";
msgSentSound.preload = "auto";

function useKeyboardSound() {
  const playClick = () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  };

  const playMessageReceive = () => {
    msgReceiveSound.currentTime = 0;
    msgReceiveSound.play().catch(() => {});
  };

  const playMessageSent = () => {
    msgSentSound.currentTime = 0;
    msgSentSound.play().catch(() => {});
  };

  return { playClick, playMessageReceive, playMessageSent };
}

export default useKeyboardSound;