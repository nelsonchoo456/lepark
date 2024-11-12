import { Button, DatePicker, Form, Input, InputNumber, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { LogoText, useAuth } from '@lepark/common-ui';
import { useState } from 'react';
import { createBooking, CreateBookingData, VisitorResponse, BookingStatusEnum } from '@lepark/data-access';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CreateFacilityBooking = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth<VisitorResponse>();

  const onFinish = async (values: any) => {
    if (!facilityId || !user) return;

    try {
      setLoading(true);
      const bookingData: CreateBookingData = {
        facilityId,
        bookingPurpose: values.bookingPurpose,
        pax: values.pax,
        dateStart: values.dateRange[0].startOf('day').toISOString(),
        dateEnd: values.dateRange[1].endOf('day').toISOString(),
        visitorRemarks: values.visitorRemarks || '',
        dateBooked: new Date(),
        paymentDeadline: undefined,
        visitorId: user?.id || '',
        bookingStatus: BookingStatusEnum.PENDING,
      };

      await createBooking(bookingData);
      navigate(`/profile`);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-4">
      <div className="w-full max-w-3xl mx-auto p-4">
        <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 mb-6">Create Booking</LogoText>

        <Form layout="vertical" onFinish={onFinish} className="bg-white p-6 rounded-lg shadow-md">
          <Form.Item label="Booking Purpose" name="bookingPurpose" rules={[{ required: true, message: 'Please enter booking purpose' }]}>
            <Input placeholder="Enter the purpose of your booking" />
          </Form.Item>

          <Form.Item label="Number of People" name="pax" rules={[{ required: true, message: 'Please enter number of people' }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item label="Booking Dates" name="dateRange" rules={[{ required: true, message: 'Please select dates' }]}>
            <RangePicker className="w-full" format="YYYY-MM-DD" disabledDate={(current) => current && current < moment().startOf('day')} />
          </Form.Item>

          <Form.Item label="Additional Remarks" name="visitorRemarks">
            <TextArea rows={4} placeholder="Any additional information or special requests" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-4">
              <Button type="primary" htmlType="submit" className="flex-1" loading={loading}>
                Submit Booking
              </Button>
              <Button onClick={() => navigate(`/facilities/${facilityId}`)} className="flex-1">
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateFacilityBooking;
