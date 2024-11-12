import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';

interface QrScannerProps {
  showScanner: boolean;
  setShowScanner: (input: any) => void;
}

export const QrScanner2 = ({ showScanner, setShowScanner }: QrScannerProps) => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);

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

  return (
    <>
      {/* <button onClick={toggleScanner}>
        {showScanner ? 'Close Scanner' : 'Open QR Scanner rrrr'}
      </button> */}

      <Modal title="Occurrence QR Scanner" open={showScanner} onCancel={() => setShowScanner(false)} footer={null}> <div id="reader" style={{ position: "fixed", top: 0, left: 0, width: '100%', height: '300px' }}></div></Modal>

      {/* {scanResult && (
        <div>
          <h3>Scanned QR Code:</h3>
          <p>{scanResult}</p>
        </div>
      )} */}
    </>
  );
};
