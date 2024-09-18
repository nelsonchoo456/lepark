import { Button } from 'antd';
import { OccurrenceResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
const QRTab = ({ occurrence }: { occurrence: OccurrenceResponse }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL("http://localhost:4201/occurrence/" + occurrence.id)
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR Code:', err);
      });
  }, [occurrence.id]);

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex flex-col justify-center items-center">
        <img src={qrCodeUrl ?? ''} alt="QR Code" className="w-48 h-48 mb-4" />
        <Button
          type="primary"
          onClick={() => {
            if (qrCodeUrl) {
              // Check if the device is mobile
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

              if (isMobile) {
                // For mobile devices, open the image in a new tab
                window.open(qrCodeUrl, '_blank');
              } else {
                // For desktop, use the download link approach
                const link = document.createElement('a');
                link.href = qrCodeUrl;
                // console.log(occurrence.title);
                link.download = `${occurrence.title}-${occurrence.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          }}
        >
          {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'View QR Code' : 'Download QR Code'}
        </Button>
      </div>
    </div>
  );
};

export default QRTab;
