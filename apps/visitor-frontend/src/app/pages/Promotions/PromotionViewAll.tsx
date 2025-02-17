import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, TreeSelect, Card, Tag, Empty } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { PiTicketFill } from 'react-icons/pi';
import { ContentWrapper, useAuth } from '@lepark/common-ui';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { PromotionStatusEnum, DiscountTypeEnum, getAllPromotions, getPromotionsByParkId, PromotionResponse, VisitorResponse } from '@lepark/data-access';
import withParkGuard from '../../park-context/withParkGuard';

const { SHOW_PARENT } = TreeSelect;

const PromotionViewAll = () => {
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedPark } = usePark();
  const [parkPromotions, setParkPromotions] = useState<PromotionResponse[]>([]);
  const [allPromotions, setAllPromotions] = useState<PromotionResponse[]>([]);

  const handleCategoryChange = (newValue: string[]) => {
    setSelectedCategory(newValue);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filterValidPromotions = (promotions: PromotionResponse[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    return promotions.filter(promotion =>
      promotion.status === PromotionStatusEnum.ENABLED &&
      new Date(promotion.validFrom) <= today &&
      new Date(promotion.validUntil) >= today
    );
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        if (selectedPark?.id) {
          const parkPromotionsResponse = await getPromotionsByParkId(selectedPark.id.toString(), false, true);
          const filteredParkPromotions = filterValidPromotions(parkPromotionsResponse.data.filter(
            promotion => promotion.parkId !== null
          ));
          setParkPromotions(filteredParkPromotions);
        }

        const allPromotionsResponse = await getAllPromotions();
        setAllPromotions(filterValidPromotions(allPromotionsResponse.data));
      } catch (error) {
        console.error('Error fetching promotions:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [selectedPark]);

  const limitedPromotions = useMemo(() => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    return allPromotions.filter(promotion => {
      const endDate = new Date(promotion.validUntil);
      return endDate <= threeDaysFromNow && endDate >= new Date();
    });
  }, [allPromotions]);

  const filterPromotions = (promotions: PromotionResponse[]) => {
    return promotions.filter(promotion =>
      promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promotion.promoCode && promotion.promoCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredAllPromotions = useMemo(() => filterPromotions(allPromotions), [allPromotions, searchQuery]);
  const filteredParkPromotions = useMemo(() => filterPromotions(parkPromotions), [parkPromotions, searchQuery]);
  const filteredLimitedPromotions = useMemo(() => filterPromotions(limitedPromotions), [limitedPromotions, searchQuery]);

  const renderPromotionCard = (promotion: PromotionResponse) => {
    // Function to truncate text
    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    // Function to render discount value
    const renderDiscountValue = () => {
      if (promotion.discountType === DiscountTypeEnum.FIXED_AMOUNT) {
        return `$${promotion.discountValue} OFF`;
      } else {
        return `${promotion.discountValue}% OFF`;
      }
    };

    return (
      <Card
        key={promotion.id}
        hoverable
        style={{ width: 240, flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden' }}
        styles={{
          body: {padding: '7px'},
        }}
        onClick={() => navigate(`/promotions/${promotion.id}`)}
        cover={
          <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden relative">
            <div className="absolute text-xl text-gray-500 text-white font-bold bg-highlightGreen-500 pl-4 pr-6 py-1 mt-2 drop-shadow-lg"
             style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%)'
          
            }}
            >{renderDiscountValue()}</div>
            {promotion.images && promotion.images.length > 0 ? (
              <img
                src={promotion.images[0]}
                alt={promotion.name}
                className="object-cover w-full h-full rounded-t-xl"
              />
            ) : (
              <Empty/>
            )}
          </div>
        }
      >
        <Card.Meta
          title={promotion.name}
          description={
            <>
              <div className="-mt-2 p-0">{truncateText(promotion.description ?? '', 30)}</div>
              <div className="mt-1">
                <span>Promocode:</span>
                <Tag color="green" bordered={false}>{promotion.promoCode}</Tag>
              </div>
            </>
          }
        />
      </Card>
    );
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">Promotions</div>
        </div>
      </ParkHeader>
      <div className="p-2 items-center bg-green-50 mt-[-1rem] backdrop-blur bg-white/10 mx-4 rounded-2xl px-4 md:flex-row md:-mt-[3rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4">
        <Input
          suffix={<FiSearch />}
          placeholder="Search Promotions..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:mb-0 md:flex-[3]"
        />
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto">
        {[
          { title: 'All Promotions', data: filteredAllPromotions },
          { title: 'Park Promotions', data: filteredParkPromotions },
           ...(filteredLimitedPromotions.length > 0 ? [{ title: 'Limited Time Offers', data: filteredLimitedPromotions }] : [])
        ].map(({ title, data }, index) => (
          <div key={index} className="flex-shrink-0 p-4">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {data.map(renderPromotionCard)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withParkGuard(PromotionViewAll);
