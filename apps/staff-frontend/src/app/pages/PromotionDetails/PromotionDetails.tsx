import { ContentWrapperDark, ImageInput, Logo, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tag, message, Switch, Spin, Space, Empty, Typography, Image, Form, Flex } from 'antd';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { PromotionResponse, StaffResponse, StaffType, updatePromotionDetails } from '@lepark/data-access';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictPromotions } from '../../hooks/Promotions/useRestrictPromotions';
import PromotionValueTag from '../Promotion/components/PromotionValueTag';
import PromotionValidityTag from '../Promotion/components/PromotionValidityTag';
import { FiInfo, FiPlus } from 'react-icons/fi';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { MdClose } from 'react-icons/md';

const { TextArea } = Input;

const PromotionDetails = () => {
  const navigate = useNavigate();
  const { promotionId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth<StaffResponse>();
  const { promotion, isArchived, loading, triggerFetch } = useRestrictPromotions(promotionId);
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const editableRbac = () => {
    return user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && !promotion?.isNParksWide);
  };
  const [inEditMode, setInEditMode] = useState(false);
  const [editedPromotion, setEditedPromotion] = useState<Partial<PromotionResponse>>();

  const [form] = Form.useForm();

  useEffect(() => {
    if (promotion?.images) {
      setCurrentImages(promotion.images);
    }

    if (promotion) {
      handleInputChange("status", promotion.status);
      
      const shouldBeInEditMode = !isArchived && 
        searchParams.get('editMode') === 'true' && 
        (user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && !promotion?.isNParksWide));
      
      setInEditMode(shouldBeInEditMode);
      
      if (shouldBeInEditMode) {
        setEditedPromotion(promotion);
      }
    }
  }, [promotion, searchParams, user, isArchived]);

  const toggleEditMode = () => {
    if (isArchived) return;
    if (inEditMode && promotion) {
      setEditedPromotion(promotion); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedPromotion((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCurrentImageClick = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    setCurrentImages((prevImages) => newImages);
    setEditedPromotion((promotion) => ({ ...promotion, images: newImages }));
  };

  const onFinish = async (values: any) => {
    try {
      form.validateFields();
      if (!promotion) {
        throw new Error('Promotion not found.');
      } else if (!(user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN)) {
        throw new Error('Not allowed to edit Promotion details.');
      }

      if (values.promoCode) {
        values.promoCode = values.promoCode.trim();
      }
      const terms = form.getFieldValue('terms');

      // Create a clean data object with only the updatable fields
      const finalData = {
        name: values.name,
        description: values.description,
        promoCode: values.promoCode,
        status: values.status,
        images: currentImages,
        terms: terms || [],
      };

      setPreviewImages([]);

      const updateRes = await updatePromotionDetails(promotion.id, finalData, selectedFiles);
      if (updateRes.status === 200) {
        await triggerFetch();
        message.success('Promotion details updated successfully!');
        setInEditMode(false);
        // Clear the URL parameter
        navigate(`/promotion/${promotion.id}`);
      } else {
        throw new Error('Failed to update promotion');
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage === 'Please enter a unique Promo Code') {
        message.error('Please enter a unique Promo Code');
      } else if (errorMessage.length < 60) {
        message.error(errorMessage);
      } else {
        message.error('An error occurred while updating the promotion');
      }
      // Only stay in edit mode if there's a validation error
      if (errorMessage === 'Please enter a unique Promo Code') {
        setInEditMode(true);
      }
    }
  };

  const descriptionsItems = [
    {
      key: 'name',
      label: 'Title',
      children: !inEditMode ? (
        promotion?.name ?? null
      ) : (
        <Input defaultValue={promotion?.name ?? ''} onChange={(e) => handleInputChange('name', e.target.value)} required />
      ),
    },
    {
      label: 'Park',
      key: 'isNParksWide',
      children: promotion?.isNParksWide ? (
        <div className="flex gap-2">
          <Logo size={1.2} />
          <LogoText>NParks-Wide</LogoText>
        </div>
      ) : (
        <div className="font-semibold">{promotion?.park?.name}</div>
      ),
    },
    {
      label: 'Promo Code',
      key: 'promoCode',
      children: !inEditMode ? (
        promotion?.promoCode
      ) : (
        <Input defaultValue={promotion?.promoCode ?? ''} onChange={(e) => handleInputChange('promoCode', e.target.value)} required />
      ),
    },
    {
      label: 'Description',
      key: 'description',
      children: !inEditMode ? (
        promotion?.description
      ) : (
        <TextArea defaultValue={promotion?.description ?? ''} onChange={(e) => handleInputChange('description', e.target.value)} required />
      ),
    },
    {
      label: 'Enabled',
      key: 'enabled',
      children: !inEditMode ? (
        promotion?.status === 'ENABLED' ? (
          <div>
            <Tag color="green" bordered={false}>
              Enabled
            </Tag>
            <p className="flex gap-2 mt-2 items-center text-sm text-secondary">
              <FiInfo className="shrink-0" />
              Enabled means Visitors will able to view and use this Promotion.
            </p>
          </div>
        ) : (
          <div>
            <Tag color="red" bordered={false}>
              Disabled
            </Tag>
            <p className="flex gap-2 mt-2 items-center text-sm text-secondary">
              <FiInfo className="shrink-0" />
              Disabled means Visitors will<strong>not</strong>be able to view or use this Promotion.
            </p>
          </div>
        )
      ) : (
        <>
          <div className="flex items-center">
            <Switch
              checked={editedPromotion?.status === 'ENABLED'}
              onChange={(checked) => handleInputChange('status', checked ? 'ENABLED' : 'DISABLED')}
            />
            <span style={{ marginLeft: 8 }}>
              {editedPromotion?.status === 'ENABLED' ? (
                <Tag color="green" bordered={false}>
                  Enabled
                </Tag>
              ) : (
                <Tag color="red" bordered={false}>
                  Disabled
                </Tag>
              )}
            </span>
          </div>
          {editedPromotion?.status === 'ENABLED' ? (
            <p className="flex gap-2 mt-2 items-center text-sm text-secondary">
              <FiInfo className="shrink-0" />
              Enabled means Visitors will able to view and use this Promotion.
            </p>
          ) : (
            <p className="flex gap-2 mt-2 items-center text-sm text-secondary">
              <FiInfo className="shrink-0" />
              Disabled means Visitors will<strong>not</strong>be able to view or use this Promotion.
            </p>
          )}
        </>
      ),
    },
    {
      key: 'images',
      label: 'Cover Image',
      children: !inEditMode ? (
        promotion && promotion.images && promotion.images.length > 0 ? (
          <Space size="large" wrap>
            {promotion.images.map((image, index) => (
              <Image key={index} height={150} src={image} className="rounded-md" />
            ))}
          </Space>
        ) : (
          <div className="h-32 flex items-center justify-center rounded-lg">
            <Empty description="No Images" imageStyle={{ height: '50px' }} />
          </div>
        )
      ) : (
        <>
          <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
          <div className="flex flex-wrap gap-2 mt-2">
            {currentImages?.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-50"
                onClick={() => handleCurrentImageClick(index)}
              />
            ))}
            {previewImages?.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`New ${index}`}
                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-50"
                onClick={() => removeImage(index)}
              />
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'terms',
      label: 'Terms & Conditions',
      children: !inEditMode ? (
        promotion && promotion.terms && promotion.terms.length > 0 ? (
          <ol className="list-decimal pl-5">
            {promotion.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ol>
        ) : (
          <p className="text-secondary">No Terms & Conditions</p>
        )
      ) : (
        <Form form={form} name="promotionTermsForm" initialValues={{ terms: promotion?.terms || [] }}>
          <Form.List name="terms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Flex gap={10} align="center">
                    <Form.Item
                      {...restField}
                      name={[name]}
                      fieldKey={fieldKey !== undefined ? fieldKey : key}
                      rules={[
                        { required: true, message: 'Enter a term or delete this field' },
                      ]}
                      className="w-full mb-2"
                    >
                      <Input placeholder="Enter a term" />
                    </Form.Item>
                    <MdClose onClick={() => remove(name)} />
                  </Flex>
                ))}
                <Form.Item className="w-full mb-2">
                  <Button type="dashed" onClick={() => add()} block icon={<FiPlus />}>
                    Add Term
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      ),
    },
  ];

  const archivedDescriptionsItems = [
    {
      key: 'name',
      label: 'Title',
      children: promotion?.name,
    },
    {
      label: 'Park',
      key: 'isNParksWide',
      children: promotion?.isNParksWide ? (
        <div className="flex gap-2">
          <Logo size={1.2} />
          <LogoText>NParks-Wide</LogoText>
        </div>
      ) : (
        <div className="font-semibold">{promotion?.park?.name}</div>
      ),
    },
    {
      label: 'Promo Code',
      key: 'promoCode',
      children: promotion?.promoCode,
    },
    {
      label: 'Description',
      key: 'description',
      children: !inEditMode ? (
        promotion?.description
      ) : (
        <TextArea defaultValue={promotion?.description ?? ''} onChange={(e) => handleInputChange('description', e.target.value)} required />
      ),
    },
  ];

  const termDescriptionItems = [
    {
      label: 'Valid Dates',
      key: 'validFrom',
      children: <PromotionValidityTag validFrom={promotion?.validFrom} validUntil={promotion?.validUntil} />,
    },
    {
      label: 'Discount Value',
      key: 'discountValue',
      children: promotion && (
        <PromotionValueTag isPercentage={promotion?.discountType === 'PERCENTAGE'}>{promotion.discountValue}</PromotionValueTag>
      ),
    },
    {
      label: 'Maximum Usage',
      key: 'maximumUsage',
      children: promotion?.maximumUsage ? promotion?.maximumUsage : <div className="text-secondary">None</div>,
    },
    {
      label: 'Minimum Amount',
      key: 'minimumAmount',
      children: promotion?.minimumAmount ? promotion?.minimumAmount : <div className="text-secondary">None</div>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Promotion Management',
      pathKey: '/promotion',
      isMain: true,
    },
    {
      title: promotion ? promotion.name : 'Promotion Details',
      pathKey: promotion ? `/promotion/${promotion.id}` : '/promotion',
      isCurrent: true,
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (!promotion) {
    return null; // This will not be rendered as the hook will redirect unauthorized access
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Descriptions
          items={isArchived ? archivedDescriptionsItems : descriptionsItems}
          bordered
          column={1}
          size="middle"
          labelStyle={{ width: '15vw' }}
          title={
            <div className="w-full flex justify-between">
              {!inEditMode ? (
                <>
                  <div>{`${promotion.name}`}</div>
                  {!isArchived && editableRbac() ? (
                    <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                  ) : !isArchived ? (
                    <></>
                  ) : (
                    <Tag bordered={false}>ARCHIVED</Tag>
                  )}
                </>
              ) : (
                <>
                  <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                    Return
                  </Button>
                  <div className="text-secondary">Edit Promotion </div>
                  <Button
                    type="primary"
                    onClick={() => onFinish(editedPromotion)}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          }
        />
        {/* <Title level={5} className="mt-4 mb-2">
          Images
        </Title>
        {promotion.images && promotion.images.length > 0 ? (
          <Space size="large" wrap>
            {promotion.images.map((image, index) => (
              <Image key={index} width={200} src={image} className="rounded-md"/>
            ))}
          </Space>
        ) : (
          <div className="h-32 bg-gray-200 flex items-center justify-center rounded-lg">
            <Empty description="No Image" imageStyle={{ height: "50px" }}/>
          </div>
        )} */}
        <br />
        <Descriptions
          items={termDescriptionItems}
          bordered
          column={1}
          size="middle"
          labelStyle={{ width: '15vw' }}
          title={
            inEditMode ? (
              <div className="flex justify-between">
                Rules
                <p className="flex gap-2 mt-2 items-center text-sm text-secondary">
                  <FiInfo className="shrink-0" />
                  Rules cannot be changed.
                </p>{' '}
              </div>
            ) : (
              'Rules'
            )
          }
          className={inEditMode ? 'opacity-60' : ''}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default PromotionDetails;
