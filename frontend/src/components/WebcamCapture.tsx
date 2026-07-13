import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  buttonText?: string;
  isLoading?: boolean;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onCapture, 
  buttonText = "Capture Photo",
  isLoading = false
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="webcam-container">
        {!isCameraReady && (
          <div className="absolute flex flex-col items-center justify-center gap-2 z-10 text-muted">
            <div className="spinner"></div>
            <p className="m-0 text-sm">Accessing Camera...</p>
          </div>
        )}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
          onUserMedia={() => setIsCameraReady(true)}
          className="w-full h-full object-cover relative z-0"
        />
        <div className="webcam-overlay z-10"></div>
      </div>
      
      <button 
        type="button" 
        className="btn btn-primary w-full mt-4" 
        onClick={capture}
        disabled={!isCameraReady || isLoading}
      >
        {isLoading ? <div className="spinner"></div> : (
          <>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
};

export default WebcamCapture;
