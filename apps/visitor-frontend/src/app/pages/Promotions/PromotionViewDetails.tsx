import { PromotionResponse, getPromotionById } from '@lepark/data-access';
import { Tabs, Typography, Tag, message, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PromotionCarousel from './components/PromotionCarousel';
import { LogoText } from '@lepark/common-ui';
import moment from 'moment';
import { CopyOutlined } from '@ant-design/icons';
import { MdContentCopy } from 'react-icons/md';

const { Title } = Typography;

const PromotionViewDetails = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const [promotion, setPromotion] = useState<PromotionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (promotionId) {
        try {
          const promotionResponse = await getPromotionById(promotionId);
          setPromotion(promotionResponse.data);
        } catch (error) {
          console.error('Error fetching promotion data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [promotionId]);

  const tabsItems = [
    {
      key: 'Promotion Details',
      label: 'Promotion Details',
      // children: promotion ? <PromotionInformationTab promotion={promotion} /> : <p>Loading promotion data...</p>,
    },
    // Add other tabs if necessary
  ];

   const renderDiscount = (discountType?: string, discountValue?: number) => {
    if (!discountType || discountValue === undefined) return 'N/A';

    switch (discountType) {
      case 'PERCENTAGE':
        return `${discountValue}% off`;
      case 'FIXED_AMOUNT':
        return `$${discountValue} off`;
      default:
        return `${discountValue} ${discountType}`;
    }
  };
    const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Promo code copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      message.error('Failed to copy promo code');
    });
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden"> {/* Updated this line */}
          <div className="z-20 absolute w-full flex justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{promotion?.name}</LogoText>
            </div>
          </div>
          <div className="w-full h-full">
            <PromotionCarousel images={promotion?.images || []} />
          </div>
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:flex items-start">
            <div className="flex-0">
              <LogoText className="text-m font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{promotion?.name}</LogoText>
              <Typography.Paragraph
                ellipsis={{
                  rows: 3,
                  expandable: true,
                  symbol: 'more',
                }}
              >
                {promotion?.description}
              </Typography.Paragraph>
              {promotion && (

                <div className="mb-4 hidden md:block">
                     <p className="font-semibold text-gray-500 inline-block mr-2">Promo Code: </p>
                <Tag color="green">{promotion.promoCode}</Tag>
                </div>
              )}
            </div>
          </div>
          <Tabs
            defaultActiveKey="information"
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
            className="md:mt-0 md:p-0"
          />

     <div className="mt-4">

  <table className="table-auto text-sm border-collapse border border-gray-300 w-full">
        <colgroup>
          <col className="w-1/3" />
          <col className="w-2/3" />
        </colgroup>
        <tbody>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">Promo Code</td>
            <td className="p-2 flex justify-between items-center">
              {promotion && (
                <>
                  <Tag color="green">{promotion.promoCode}</Tag>
                  <MdContentCopy
                    className="cursor-pointer ml-2"
                    onClick={() => copyToClipboard(promotion.promoCode ?? '')}
                  />
                </>
              )}
            </td>
          </tr>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">Park</td>
            <td className="p-2">
              {promotion?.park?.id === undefined ? 'All Parks' : promotion?.park?.name}
            </td>
          </tr>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">Discount</td>
            <td className="p-2">{renderDiscount(promotion?.discountType, promotion?.discountValue)}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">Start Date</td>
            <td className="p-2">{promotion?.validFrom && moment(promotion.validFrom).format('MMMM D, YYYY')}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">End Date</td>
            <td className="p-2">{promotion?.validUntil && moment(promotion.validUntil).format('MMMM D, YYYY')}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="pr-4 font-semibold p-2">Description</td>
            <td className="p-2">
              <Typography.Paragraph
                ellipsis={{
                  rows: 3,
                  expandable: true,
                  symbol: 'more',
                }}
              >
                {promotion?.description}
              </Typography.Paragraph>
            </td>
          </tr>
        </tbody>
      </table>
</div>
 <div className="mt-4 w-full">

          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionViewDetails;
