import { useEffect } from "react";

const VidPlayer = ({playUrl, shouldRevoke}:{playUrl:string, shouldRevoke:boolean}) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (shouldRevoke) {
        window.opener.URL.revokeObjectURL(playUrl);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [playUrl, shouldRevoke]);

  return (
    <>
      <video src={playUrl} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} controls autoPlay></video>
    </>
  );
};
export default VidPlayer;