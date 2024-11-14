import { Button, DatePicker, Form, Input, InputNumber, Typography, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { LogoText, useAuth } from '@lepark/common-ui';
import { useEffect, useState } from 'react';
import {
  createBooking,
  CreateBookingData,
  VisitorResponse,
  BookingStatusEnum,
  getFacilityById,
  getBookingsByFacilityId,
} from '@lepark/data-access';

dayjs.extend(isBetween);

const { TextArea } = Input;

const CreateFacilityBooking = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [facility, setFacility] = useState<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth<VisitorResponse>();
  const [form] = Form.useForm();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const loadFacilityData = async () => {
      if (facilityId) {
        try {
          const [facilityData, bookingsData] = await Promise.all([getFacilityById(facilityId), getBookingsByFacilityId(facilityId)]);

          setFacility(facilityData.data);
          const activeBookings = bookingsData.data.filter(
            (booking) => !['CANCELLED', 'REJECTED', 'UNPAID_CLOSED'].includes(booking.bookingStatus),
          );
          setBookings(activeBookings);
        } catch (error) {
          console.error('Error loading facility data:', error);
        }
      }
    };
    loadFacilityData();
  }, [facilityId]);

  const isDateBooked = (date: dayjs.Dayjs) => {
    return bookings.some((booking) => {
      const startDate = dayjs(booking.dateStart);
      const endDate = dayjs(booking.dateEnd);
      return date.isBetween(startDate, endDate, 'day', '[]');
    });
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const endDate = form.getFieldValue('dateEnd');
    if (endDate && date.isAfter(endDate)) {
      form.setFieldsValue({
        dateStart: endDate,
        dateEnd: date,
      });
    }
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;

    const startDate = form.getFieldValue('dateStart');
    if (startDate && date.isBefore(startDate)) {
      form.setFieldsValue({
        dateStart: date,
        dateEnd: startDate,
      });
    }
  };

  const onFinish = async (values: any) => {
    if (!facilityId || !user) return;

    try {
      setLoading(true);
      const bookingData: CreateBookingData = {
        facilityId,
        bookingPurpose: values.bookingPurpose,
        pax: values.pax,
        dateStart: values.dateStart.startOf('day').toISOString(),
        dateEnd: values.dateEnd.endOf('day').toISOString(),
        visitorRemarks: values.visitorRemarks || '',
        dateBooked: new Date(),
        paymentDeadline: undefined,
        visitorId: user?.id || '',
        bookingStatus: BookingStatusEnum.PENDING,
      };

      await createBooking(bookingData);
      navigate(`/profile`);
      message.success('Booking created successfully');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      if (error.message?.includes('existing bookings within the selected date range')) {
        message.error('There are existing bookings within the selected date range. Please select different dates.');
      } else {
        message.error('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-4">
      <div className="w-full max-w-3xl mx-auto p-4">
        <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 mb-6">Create Booking</LogoText>

        <Form form={form} layout="vertical" onFinish={onFinish} className="bg-white p-6 rounded-lg shadow-md">
          <Form.Item label="Booking Purpose" name="bookingPurpose" rules={[{ required: true, message: 'Please enter booking purpose' }]}>
            <Input placeholder="Enter the purpose of your booking" />
          </Form.Item>

          <Form.Item
            label="Number of People"
            name="pax"
            rules={[
              { required: true, message: 'Please enter number of people' },
              {
                validator: (_, value) => {
                  if (value > facility?.capacity) {
                    return Promise.reject(`Number of people cannot exceed facility capacity of ${facility?.capacity}`);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1}
              max={facility?.capacity}
              className="w-full"
              controls
              placeholder="Number of People"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              label="Start Date"
              name="dateStart"
              className="flex-1"
              rules={[
                { required: true, message: 'Please select start date' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const endDate = getFieldValue('dateEnd');
                    if (endDate && value.isAfter(endDate)) {
                      return Promise.reject('Start date cannot be after end date');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  return current < dayjs().startOf('day') || isDateBooked(current);
                }}
                onChange={handleStartDateChange}
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="dateEnd"
              className="flex-1"
              rules={[
                { required: true, message: 'Please select end date' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const startDate = getFieldValue('dateStart');
                    if (startDate && value.isBefore(startDate)) {
                      return Promise.reject('End date cannot be before start date');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue('dateStart');
                  return current < dayjs().startOf('day') || (startDate && current < startDate) || isDateBooked(current);
                }}
                onChange={handleEndDateChange}
              />
            </Form.Item>
          </div>

          <Form.Item label="Additional Remarks" name="visitorRemarks">
            <TextArea rows={4} placeholder="Any additional information or special requests" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-4">
              <Button type="primary" htmlType="submit" className="flex-1" loading={loading}>
                Submit Booking
              </Button>
              <Button onClick={() => navigate(`/facility/${facilityId}`)} className="flex-1">
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
