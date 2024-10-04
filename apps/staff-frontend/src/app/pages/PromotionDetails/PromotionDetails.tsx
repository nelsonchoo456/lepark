import { ContentWrapper, ContentWrapperDark, Logo, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message, Select, Switch, notification, Spin } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Layout } from 'antd';
import { DiscountTypeEnum, getAllParks, ParkResponse, PromotionResponse, PromotionStatusEnum } from '@lepark/data-access';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictPromotions } from '../../hooks/Promotions/useRestrictPromotions';
import PromotionValueTag from '../Promotion/components/PromotionValueTag';
import PromotionValidityTag from '../Promotion/components/PromotionValidityTag';

const { TextArea } = Input;

const initialPromotion = {
  id: '',
  name: '',
  isNParksWide: false,
  discountValue: 0,
  validFrom: '',
  validUntil: '',
  discountType: DiscountTypeEnum.PERCENTAGE,
  terms: [],
  description: '',
  promoCode: '',
  status: PromotionStatusEnum.ENABLED,
};

const PromotionDetails = () => {
  const { promotionId = '' } = useParams();
  const { user, updateUser } = useAuth<PromotionResponse>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { promotion, loading } = useRestrictPromotions(promotionId);
  const [inEditMode, setInEditMode] = useState(false);
  const [editedPromotion, setEditedPromotion] = useState<PromotionResponse>(initialPromotion);
  const [emailError, setEmailError] = useState('');
  const [contactNumberError, setContactNumberError] = useState('');
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const notificationShown = useRef(false);
  const navigate = useNavigate();

  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
  };

  const toggleEditMode = () => {
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

  const onFinish = async (values: any) => {
    try {
      // if (!user) {
      //   throw new Error('User not found.');
      // } else if (!(user.role == PromotionType.MANAGER || user.role == PromotionType.SUPERADMIN)) {
      //   throw new Error('Not allowed to edit staff details.');
      // }

      // const updatedPromotionDetails: PromotionUpdateData = {
      //   firstName: values.firstName,
      //   lastName: values.lastName,
      //   contactNumber: values.contactNumber,
      //   email: values.email,
      // };

      // const responsePromotionRole = await updatePromotionRole(staffId, values.role, user.id);
      // // console.log('Promotion role updated successfully:', responsePromotionRole.data);

      // const responsePromotionActiveStatus = await updatePromotionIsActive(staffId, values.isActive, user.id);
      // // console.log('Promotion active status updated successfully:', responsePromotionActiveStatus.data);

      // const responsePromotionDetails = await updatePromotionDetails(staffId, updatedPromotionDetails);
      // console.log('Promotion details updated successfully:', responsePromotionDetails.data);

      message.success('Promotion details updated successfully!');
      setInEditMode(false); // Exit edit mode
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Unique constraint failed on the fields: (`email`)')) {
        message.error('The email address is already in use. Please use a different email.');
        // Remove this line to stay in edit mode
        // setInEditMode(false);
      } else if (errorMessage.includes('Invalid email address')) {
        message.error('Invalid email format.');
      } else {
        message.error(errorMessage || 'Failed to update staff details.');
      }
      // Add this line to ensure we stay in edit mode for all error cases
      setInEditMode(true);
    }
  };

  const handleSave = () => {
    // const isContactNumberValid = validateContactNumber(editedUser?.contactNumber ?? '');
    // const isEmailValid = validateEmail(editedUser?.email ?? '');
    // if (isContactNumberValid && isEmailValid && validateInputs()) {
    //   onFinish(editedUser);
    //   // Remove this line to let onFinish handle the edit mode
    //   // setInEditMode(false);
    // } else {
    //   message.warning('All fields are required.');
    // }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validateContactNumber = (value: string) => {
    const pattern = /^[689]\d{7}$/;
    if (!pattern.test(value)) {
      setContactNumberError('Contact number must consist of exactly 8 digits and be a valid Singapore contact number');
      return false;
    } else {
      setContactNumberError('');
      return true;
    }
  };

  const handleEmailChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    validateEmail(value);
    handleInputChange('email', value);
  };

  const handleContactNumberChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    validateContactNumber(value);
    handleInputChange('contactNumber', value);
  };

  const descriptionsItems = [
    {
      key: 'name',
      label: 'Name',
      children: !inEditMode ? (
        promotion?.name ?? null
      ) : (
        <Input defaultValue={promotion?.name ?? ''} onChange={(e) => handleInputChange('name', e.target.value)} required />
      ),
    },
    {
      label: 'Park',
      key: 'isNParksWide',
      children: promotion?.isNParksWide? (
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
      label: 'Validity',
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
      label: 'One Time Claim?',
      key: 'isOneTimeClaim',
      children: promotion?.isOneTime ? 'True' : <div className="text-secondary">False</div>,
    },
    {
      label: 'Minimum Amount',
      key: 'minimumAmount',
      children: promotion?.minimumAmount ? promotion?.minimumAmount : <div className="text-secondary">None</div>,
    },
    {
      label: 'Enabled',
      key: 'enabled',
      children: !inEditMode ? (
        promotion?.status === 'ENABLED' ? (
          <Tag color="green">Enabled</Tag>
        ) : (
          <Tag color="red">Disabled</Tag>
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Switch checked={editedPromotion?.status === "ENABLED"} onChange={(checked) => handleInputChange('status', checked ? "ENABLED" : "DISABLED")} />
          <span style={{ marginLeft: 8 }}>{editedPromotion?.status === "ENABLED" ? 'Enabled' : 'Disabled'}</span>
        </div>
      ),
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
          items={descriptionsItems}
          bordered
          column={1}
          size="middle"
          title={
            <div className="w-full flex justify-between">
              {!inEditMode ? (
                <>
                  <div>{`${promotion.name}`}</div>
                  <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                </>
              ) : (
                <>
                  <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                    Return
                  </Button>
                  <div className="text-secondary">Edit Promotion </div>
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          }
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default PromotionDetails;
