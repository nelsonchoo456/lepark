import React from 'react';
import { Descriptions, Divider, Button, Tooltip } from 'antd';
import { BookingResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';

interface InformationTabProps {
  booking: BookingResponse;
}

const InformationTab: React.FC<InformationTabProps> = ({ booking }) => {
  const navigate = useNavigate();

  const formatStatus = (status: string) => {
    return status
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const descriptionsItems = [
    { key: 'bookingPurpose', label: 'Booking Purpose', children: booking.bookingPurpose },
    { key: 'pax', label: 'Pax', children: booking.pax },
    { key: 'bookingStatus', label: 'Status', children: formatStatus(booking.bookingStatus) },
    { key: 'dateStart', label: 'Date Start', children: new Date(booking.dateStart).toLocaleDateString() },
    { key: 'dateEnd', label: 'Date End', children: new Date(booking.dateEnd).toLocaleDateString() },
    { key: 'dateBooked', label: 'Date Booked', children: new Date(booking.dateBooked).toLocaleDateString() },
    {
      key: 'paymentDeadline',
      label: 'Payment Deadline',
      children: booking.paymentDeadline ? new Date(booking.paymentDeadline).toLocaleDateString() : 'N/A',
    },
    { key: 'visitorRemarks', label: 'Visitor Remarks', children: booking.visitorRemarks },
  ];

  const facilityDescriptionsItems = booking.facility
    ? [
        {
          key: 'facilityName',
          label: 'Facility Name',
          children: (
            <div>
              <span>{booking.facility.name}</span>
              <Tooltip title="Go to Facility">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigate(`/facilities/${booking.facilityId}`)} />
              </Tooltip>
            </div>
          ),
        },
        { key: 'facilityDescription', label: 'Facility Description', children: booking.facility.description },
      ]
    : [];

  return (
    <div>
      <Divider orientation="left">Booking Details</Divider>
      <Descriptions items={descriptionsItems} bordered column={1} labelStyle={{ width: '15vw' }} />
      {facilityDescriptionsItems.length > 0 && (
        <>
          <Divider orientation="left">Facility Details</Divider>
          <Descriptions items={facilityDescriptionsItems} bordered column={1} labelStyle={{ width: '15vw' }} />
        </>
      )}
    </div>
  );
};

export default InformationTab;
