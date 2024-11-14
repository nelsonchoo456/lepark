import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, message, Space, Tabs, Typography, Modal } from 'antd';
import { BookingStatusEnum, StaffResponse, StaffType, updateBooking, updateBookingStatus } from '@lepark/data-access';
import { useRestrictBooking } from '../../hooks/Booking/useRestrictBooking';
import InformationTab from './components/InformationTab';
import PageHeader2 from '../../components/main/PageHeader2';
import moment from 'moment';

const { Text } = Typography;

const ViewBookingDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { booking, loading } = useRestrictBooking(bookingId);
  const [messageApi, contextHolder] = message.useMessage();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject'>();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return null; // This will handle cases where the booking is not found or user doesn't have access
  }

  const breadcrumbItems = [
    {
      title: 'Booking Management',
      pathKey: '/facilities/bookings',
      isMain: true,
    },
    {
      title: booking.bookingPurpose,
      pathKey: `/facilities/bookings/${booking.id}`,
      isCurrent: true,
    },
  ];

  const handleAccept = () => {
    setAction('accept');
    setConfirmModalVisible(true);
  };

  const handleReject = () => {
    setAction('reject');
    setRejectModalVisible(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      const newStatus =
        action === 'accept'
          ? booking.facility?.fee && booking.facility.fee > 0
            ? BookingStatusEnum.APPROVED_PENDING_PAYMENT
            : BookingStatusEnum.CONFIRMED
          : BookingStatusEnum.REJECTED;

      const updateData: any = { bookingStatus: newStatus };

      if (action === 'accept' && booking.facility?.fee && booking.facility.fee > 0) {
        const paymentDeadline = moment().add(3, 'days').toISOString();
        updateData.paymentDeadline = paymentDeadline;
      }

      console.log('updateData', updateData);
      await updateBooking(booking.id, updateData);
      messageApi.success(`Booking ${action === 'accept' ? 'approved' : 'rejected'} successfully.`);
      navigate(0); // Refresh the page
    } catch (error) {
      messageApi.error(`Failed to ${action === 'accept' ? 'approve' : 'reject'} booking.`);
    } finally {
      setConfirmLoading(false);
      setConfirmModalVisible(false);
      setRejectModalVisible(false);
    }
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="flex-1 flex-col flex">
            <div className="w-full flex justify-between items-center">
              <Space>
                <LogoText className="text-2xl py-2 m-0 ml-4">{booking.bookingPurpose}</LogoText>
              </Space>
              <Space>
                {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.LANDSCAPE_ARCHITECT) &&
                  booking.bookingStatus === BookingStatusEnum.PENDING && (
                    <>
                      <Button type="primary" onClick={handleAccept}>
                        Accept
                      </Button>
                      <Button type="primary" danger onClick={handleReject}>
                        Reject
                      </Button>
                    </>
                  )}
              </Space>
            </div>
            <div className="w-full flex justify-between items-left ml-4 mt-4">
              <div className="max-w-4xl text-sm mr-auto">
                <p>{booking.visitorRemarks}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="information"
          items={[
            {
              key: 'information',
              label: 'Information',
              children: <InformationTab booking={booking} />,
            },
          ]}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>

      <Modal
        title="Confirm Action"
        open={confirmModalVisible || rejectModalVisible}
        onOk={handleConfirm}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setConfirmModalVisible(false);
          setRejectModalVisible(false);
        }}
      >
        <p>Are you sure you want to {action === 'accept' ? 'accept' : 'reject'} this booking?</p>
      </Modal>
    </ContentWrapperDark>
  );
};

export default ViewBookingDetails;
