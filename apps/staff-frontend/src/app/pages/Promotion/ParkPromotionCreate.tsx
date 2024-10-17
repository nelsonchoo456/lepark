import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Button, Card, DatePicker, Divider, Flex, Form, Input, InputNumber, message, Radio, Result, Select, Space } from 'antd';
import { ParkResponse, StaffResponse, PromotionResponse, StaffType, createPromotion } from '@lepark/data-access';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ParkPromotionCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const [openParks, setOpenParks] = useState(parks);

  const [form] = Form.useForm();
  const [createdData, setCreatedData] = useState<PromotionResponse | null>();
  const discountType = Form.useWatch('discountType', form);
  const isNParksWide = Form.useWatch('isNParksWide', form);

  const maximumUsage = Form.useWatch('maximumUsage', form);
  const minimumAmount = Form.useWatch('minimumAmount', form);
  const terms = Form.useWatch('terms', form);

  useEffect(() => {
    if (discountType) {
      form.setFieldsValue({ discountValuePercentage: 0.1, discountValueFixed: 0.1 });
    }
  }, [discountType]);

  useEffect(() => {
    if (parks && parks.length > 0) {
      setOpenParks(parks.filter((park: ParkResponse) => park.parkStatus === 'OPEN'));
    }
  }, [parks]);

  const yesNoOptions = [
    {
      label: 'Yes',
      value: true,
    },
    {
      label: 'No',
      value: false,
    },
  ];

  const discountTypeOptions = [
    {
      label: 'Percentage',
      value: 'PERCENTAGE',
    },
    {
      label: 'Fixed Amount',
      value: 'FIXED_AMOUNT',
    },
  ];

  const disabledDate = (current: dayjs.Dayjs) => {
    if (current && current < dayjs().startOf('day')) {
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, discountValueFixed, discountValuePercentage, terms, ...rest } = values;
      const validFrom = dateRange[0].toISOString();
      const validUntil = dateRange[1].toISOString();
      let discountValue;
      if (discountType === 'PERCENTAGE') {
        discountValue = discountValuePercentage;
      } else {
        discountValue = discountValueFixed;
      }

      let inputTerms = [];
      if (terms) {
        inputTerms = terms.filter((t: any) => t !== null && t !== undefined && typeof t === 'string' && t.trim().length > 0);
      }

      const finalData = {
        ...rest,
        status: 'ENABLED',
        terms: inputTerms,
        discountValue,
        validFrom,
        validUntil,
      };

      if (user?.role !== StaffType.SUPERADMIN) {
        finalData.parkId = user?.parkId;
        finalData.isNParksWide = false;
      }

      const response = await createPromotion(finalData, selectedFiles);
      if (response?.status && response.status === 201) {
        setCreatedData(response.data);
      }
    } catch (error) {
      if ((error as { errorFields?: any }).errorFields) {
        console.log('Validation failed:', (error as { errorFields?: any }).errorFields);
      } else {
        console.log(error);
        messageApi.open({
          type: 'error',
          content: 'Unable to create Promotion. Please try again later.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Promotion Management',
      pathKey: '/promotion',
      isMain: true,
    },
    {
      title: 'Create Park Promotion',
      pathKey: `/promotion/create-for-park`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
            {user?.role === StaffType.SUPERADMIN ? (
              <>
                <Divider orientation="left">Park</Divider>
                <Form.Item name="isNParksWide" label="NParks Wide?" rules={[{ required: true }]}>
                  <Radio.Group options={yesNoOptions} optionType="button" />
                </Form.Item>
                {isNParksWide === false && (
                  <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
                    <Select
                      placeholder="Select a Park"
                      options={openParks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
                    />
                  </Form.Item>
                )}
              </>
            ) : (
              <Form.Item name="parkId" label="Park">
                {parks?.find((park) => park.id === user?.parkId)?.name || 'Loading...'}
              </Form.Item>
            )}

            <Divider orientation="left">Promotion Display</Divider>
            <Form.Item name="name" label="Title" rules={[{ required: true, message: 'Please enter Title' }]}>
              <Input placeholder="Enter Title" />
            </Form.Item>
            <Form.Item name="promoCode" label="Promo Code" rules={[{ required: true, message: 'Please enter Promo Code' }]}>
              <Input placeholder="Enter a unique Promo Code" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item label={'Image'}>
              <ImageInput type="file" onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>
            {previewImages?.length > 0 && (
              <Form.Item label={'Image Previews'}>
                <div className="flex flex-wrap gap-2">
                  {previewImages.map((imgSrc, index) => (
                    <img
                      key={index}
                      src={imgSrc}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                      onClick={() => removeImage(index)}
                    />
                  ))}
                </div>
              </Form.Item>
            )}

            <Divider orientation="left">Promotion Rules</Divider>
            <Form.Item name="dateRange" label="Valid Dates" rules={[{ required: true, message: 'Please enter Start Date' }]}>
              <RangePicker className="w-full" format="YYYY-MM-DD" disabledDate={(current) => disabledDate(dayjs(current.toDate()))} />
            </Form.Item>

            <Form.Item name="discountType" label="Discount Type" rules={[{ required: true }]}>
              <Radio.Group options={discountTypeOptions} />
            </Form.Item>
            {discountType === 'PERCENTAGE' && (
              <Form.Item
                name="discountValuePercentage"
                label="Discount Percentage (%)"
                rules={[{ required: true, message: 'Please enter a Percentage' }]}
              >
                <InputNumber min={0.1} max={100} precision={2} defaultValue={0.1} />
              </Form.Item>
            )}

            {discountType === 'FIXED_AMOUNT' && (
              <Form.Item
                name="discountValueFixed"
                label="Discount Amount ($)"
                rules={[{ required: true, message: 'Please enter an Amount' }]}
              >
                <InputNumber min={0.1} max={500} precision={2} defaultValue={0.1} />
              </Form.Item>
            )}

            <Divider orientation="left">Redemption Rules</Divider>

            <Form.Item name="maximumUsage" label="Total Redemption Limit">
              <InputNumber min={1} precision={0} placeholder="Leave empty if unlimited" className="w-full" />
            </Form.Item>

            <Form.Item name="minimumAmount" label="Minimum Amount (SGD)">
              <InputNumber min={0.1} precision={2} placeholder="Leave empty if no minimum amount" className="w-full" />
            </Form.Item>

            <Divider orientation="left">Terms and Conditions</Divider>
            <Form.Item label={'Terms & Conditions'}>
              <Form.List name="terms">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                      <Form.Item colon={false} className="mb-2">
                        <Flex gap={10}>
                          <Form.Item
                            {...restField}
                            key={key}
                            name={[name]}
                            noStyle
                            fieldKey={fieldKey !== undefined ? fieldKey : key}
                            className="w-full mb-2"
                            rules={[
                              { required: true, message: 'Enter a term or delete this field' },
                              {
                                validator: (_, value) => {
                                  if (value && value.trim().length === 0) {
                                    return Promise.reject('Enter a term or delete this field');
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input placeholder="Enter a term" />
                          </Form.Item>
                          <Button onClick={() => remove(name)} icon={<MdClose />} shape="circle" />
                        </Flex>
                      </Form.Item>
                    ))}

                    <Form.Item colon={false} className="mb-2">
                      <Button type="dashed" onClick={() => add()} block icon={<FiPlus />}>
                        Add
                      </Button>
                    </Form.Item>

                    {maximumUsage !== undefined && typeof maximumUsage === "number" && (
                      <Form.Item colon={false} className="p-0 mb-2">
                        <Button
                          type="dashed"
                          onClick={() => add(`This offer is limited to the first ${maximumUsage} users`)}
                          block
                          className="text-green-400 text-wrap"
                          style={{
                            display: 'block',
                            textAlign: 'left',
                            height: 'auto',
                            lineHeight: 'normal',
                          }}
                        >
                          <p>
                            <span className="text-secondary italic text-green-600">Suggested: </span> This offer is limited to the first{' '}
                            {maximumUsage} users.
                          </p>
                        </Button>
                      </Form.Item>
                    )}
                    {minimumAmount !== undefined && typeof minimumAmount === "number" && (
                      <Form.Item colon={false} className="p-0 mb-2">
                        <Button
                          type="dashed"
                          onClick={() => add(`A minimum purchase of SGD $${minimumAmount} is required.`)}
                          block
                          className="text-green-400 text-wrap"
                          style={{
                            display: 'block',
                            textAlign: 'left',
                            height: 'auto',
                            lineHeight: 'normal',
                          }}
                        >
                          <p>
                            <span className="text-secondary italic text-green-600">Suggested: </span> A minimum purchase of SGD $
                            {minimumAmount} is required.
                          </p>
                        </Button>
                      </Form.Item>
                    )}
                  </>
                )}
              </Form.List>
            </Form.Item>
            <Form.Item label={' '} colon={false}>
              <Button type="primary" className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Created new Promotion"
              subTitle={createdData && <>Event title: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/promotion')}>
                  Back to Promotion Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/promotion/${createdData?.id}`)}>
                  View new Promotion
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkPromotionCreate;
