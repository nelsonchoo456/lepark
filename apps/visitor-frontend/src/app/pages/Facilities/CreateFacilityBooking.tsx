import { Button, DatePicker, Form, Input, InputNumber, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { LogoText, useAuth } from '@lepark/common-ui';
import { useEffect, useState } from 'react';
import { createBooking, CreateBookingData, VisitorResponse, BookingStatusEnum, getFacilityById } from '@lepark/data-access';

const { TextArea } = Input;

const CreateFacilityBooking = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [facility, setFacility] = useState<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth<VisitorResponse>();
  const [form] = Form.useForm();

  useEffect(() => {
    const loadFacility = async () => {
      if (facilityId) {
        try {
          const facilityData = await getFacilityById(facilityId);
          setFacility(facilityData.data);
        } catch (error) {
          console.error('Error loading facility:', error);
        }
      }
    };
    loadFacility();
  }, [facilityId]);

  const handleStartDateChange = (date: moment.Moment | null) => {
    if (!date) return;

    const endDate = form.getFieldValue('dateEnd');
    if (endDate && date.isAfter(endDate)) {
      form.setFieldsValue({
        dateStart: endDate,
        dateEnd: date,
      });
    }
  };

  const handleEndDateChange = (date: moment.Moment | null) => {
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
            <InputNumber min={1} max={facility?.capacity} className="w-full" placeholder="Number of People" style={{ width: '100%' }} />
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
                disabledDate={(current) => current && current < moment().startOf('day')}
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
                  return (current && current < moment().startOf('day')) || (startDate && current && current < startDate);
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
