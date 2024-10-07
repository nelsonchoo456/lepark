import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';


export const QrScanner2 = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false // This is the third argument, used for verbose logging (false disables it)
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          scanner.clear(); // Stop scanning once we have a result
          navigate(decodedText.slice(22))
          setShowScanner(false); // Hide the scanner
        },
        (error) => {
          console.error('QR Code scan error: ', error);
        }
      );

      return () => {
        scanner.clear(); // Cleanup the scanner when component unmounts
      };
    }
  }, [showScanner]);

  const toggleScanner = () => {
    setShowScanner(!showScanner);
  };

  return (
    <div>
      <button onClick={toggleScanner}>
        {showScanner ? 'Close Scanner' : 'Open QR Scanner rrrr'}
      </button>

      {showScanner && <div id="reader" style={{ width: '300px', height: '300px' }}></div>}

      {scanResult && (
        <div>
          <h3>Scanned QR Code:</h3>
          <p>{scanResult}</p>
        </div>
      )}
    </div>
  );
};
