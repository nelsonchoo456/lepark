import React, { useState } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';

export const QrScanner3: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  };

  const openCamera = async () => {
    if (!isMobileDevice()) {
      alert('Camera access is only available on mobile devices.');
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      console.log('Photo URI:', photo.webPath);
      // Process the QR code using an image-based QR code scanner
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  return (
    <div>

      {isMobileDevice() ? (
        <button onClick={openCamera}>
          kek Open Camera
        </button>
      ) : (
        <p>Camera access is only available on mobile devices.</p>
      )}
      {scanResult && (
        <div>
          <h3>Scanned QR Code:</h3>
          <p>{scanResult}</p>
        </div>
      )} 
    </div>
  );
};
