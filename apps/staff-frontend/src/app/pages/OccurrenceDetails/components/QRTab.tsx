import { Descriptions, Tag } from 'antd';
import { SpeciesResponse } from '@lepark/data-access';
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { OccurrenceResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QRTab = ({ occurrence }: { occurrence: OccurrenceResponse }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL("http://testURLforOccurrenceId" + occurrence.id)
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR Code:', err);
      });
  }, [occurrence.id]);

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex justify-center items-center">
        <img src={qrCodeUrl ?? ''} alt="QR Code" className="w-48 h-48" />
      </div>
    </div>
  );
};

export default QRTab;
