import React from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Divider, LogoText } from '@lepark/common-ui';

const Payment = () => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    console.log('Payment Details:', values);
    // Add payment processing logic here
    navigate('/confirmation');
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // TODO: see if stripe has their own form components
  // maybe can add checkout items and total amount at the side / below the form
  return (
    <div className="flex items-center justify-center p-4">
    <div className="flex items-center flex-col w-full max-w-screen-sm p-4 md:p-16">
      <LogoText className="text-3xl mb-4">Payment</LogoText>
      <Form layout="vertical" onFinish={handleSubmit} className="w-full">
      <Form.Item
          name="cardholderName"
          label="Cardholder Name"
          rules={[{ required: true, message: 'Please enter your cardholder name' }]}
        >
          <Input placeholder="Full name on card" />
        </Form.Item>
        <Form.Item
          name="cardNumber"
          label="Card Number"
          rules={[{ required: true, message: 'Please enter your card number' }]}
        >
          <Input placeholder="Card Number" />
        </Form.Item>
        <Form.Item
          name="expiryDate"
          label="Expiry Date"
          rules={[{ required: true, message: 'Please enter the expiry date' }]}
        >
          <Input placeholder="MM/YY" />
        </Form.Item>
        <Form.Item
          name="cvv"
          label="CVV"
          rules={[{ required: true, message: 'Please enter the CVV' }]}
        >
          <Input placeholder="CVV" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Pay
          </Button>
        </Form.Item>
      </Form>
    </div>
    </div>
  );
};

export default Payment;