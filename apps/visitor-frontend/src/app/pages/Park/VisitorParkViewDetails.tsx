import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Tabs, Typography, Tag, Button, Descriptions, Divider, Carousel, Badge, Row, Col, Card, Empty } from 'antd';
import moment from 'moment';
import { ContentWrapper, LogoText } from '@lepark/common-ui';
import {
  AttractionResponse,
  AttractionStatusEnum,
  getAttractionsByParkId,
  getEventCountByParkId,
  getParkById,
  getSpeciesCountByParkId,
} from '@lepark/data-access';
import { ParkResponse } from '@lepark/data-access';
import SpeciesCarousel from '../Taxonomy/components/SpeciesCarousel';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IoInformationCircleOutline, IoInformationOutline } from 'react-icons/io5';
import { HiInformationCircle } from 'react-icons/hi';
import { TbTrees } from 'react-icons/tb';
import { BsInfoCircleFill } from 'react-icons/bs';
import { FaLeaf } from 'react-icons/fa';
import { MdArrowForward, MdArrowOutward } from 'react-icons/md';
import CountUp from 'react-countup';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { PiPlant } from 'react-icons/pi';
import { FaLocationDot } from 'react-icons/fa6';

const { Title, Text } = Typography;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatHours = (openingHours: Date[], closingHours: Date[]) => {
  return daysOfWeek.map((day, index) => {
    const opening = openingHours[index] ? moment(openingHours[index]).format('h:mm A') : 'Closed';
    const closing = closingHours[index] ? moment(closingHours[index]).format('h:mm A') : 'Closed';
    return { day, hours: `${opening} - ${closing}` };
  });
};

const VisitorViewParkDetails = () => {
  const { parkId } = useParams<{ parkId: string }>();
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingHours, setOpeningHours] = useState<string[]>();
  const [closingHours, setClosingHours] = useState<string[]>();
  const [attractions, setAttractions] = useState<AttractionResponse[]>();
  const [speciesCount, setSpeciesCount] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const todayIndex = dayjs().day() - 1;
  const navigate = useNavigate();
  const carouselSettings = {
    arrows: true,
  };

  useEffect(() => {
    const fetchPark = async () => {
      if (parkId) {
        try {
          setLoading(true);
          const response = await getParkById(parseInt(parkId, 10));

          // Format Hours
          const openingHours = response.data?.openingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));
          const closingHours = response.data?.closingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));

          setOpeningHours(openingHours);
          setClosingHours(closingHours);

          setPark(response.data);
        } catch (error) {
          console.error('Error fetching park:', error);
        } finally {
          setLoading(false);
        }
      }

      if (parkId) {
        try {
          const response = await getAttractionsByParkId(parseInt(parkId));
          setAttractions(response.data);
        } catch (error) {
          console.error('Error fetching attractions:', error);
        } finally {
          setLoading(false);
        }
      }

      if (parkId) {
        try {
          // Statistics
          const speciesCountRes = await getSpeciesCountByParkId(parseInt(parkId));
          if (speciesCountRes.status === 200) {
            setSpeciesCount(speciesCountRes.data);
          }
          const eventCountRes = await getEventCountByParkId(parseInt(parkId));
          if (eventCountRes.status === 200) {
            setEventCount(eventCountRes.data);
          }
        } catch (error) {
          console.error('Error fetching Park Statistics:', error);
        }
      }
    };

    fetchPark();
  }, [parkId]);

  const tabsItems = [
    {
      key: 'whatToDo',
      label: (
        <div className="flex items-center">
          <TbTrees className="text-xl mr-2" />
          About
        </div>
      ),
      children: (
        <div>
          <div className="w-full md:flex p-4">
            <LogoText className="text-xl font-bold md:font-semibold md:w-full text-center">Featured Attractions</LogoText>
          </div>
          {/* <div className="h-8" /> */}
          <div className="bg-green-50 h-64 flex items-center justify-center px-4">
            <div className="text-secondary">Coming soon</div>
            {/*<Row gutter={[16, 16]}>
               attractions &&
                attractions.length > 0 &&
                attractions.map((attraction) => (
                  <Col xs={24} sm={12} md={8} key={attraction.id}>
                    <Card
                      hoverable
                      className="w-full h-full"
                      cover={
                        attraction.images && attraction.images.length > 0 ? (
                          <img alt={attraction.title} src={attraction.images[0]} className="h-[150px] object-cover" />
                        ) : (
                          <div className="h-[150px] bg-gray-100 flex items-center justify-center">
                            <Empty description="No Image" />
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <div className="flex flex-col">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <Title level={5} className="m-0 break-words" style={{ maxWidth: '100%' }}>
                                {attraction.title}
                              </Title>
                            </div>
                          </div>
                        }
                        description={
                          <>
                            <Text ellipsis className="mt-2 block text-sm">
                              {attraction.description}
                            </Text>
                            <div className="mt-2" />
                            <Button type="link" disabled className="p-0 mt-2 text-sm">
                      View Details
                    </Button> 
                          </>
                        }
                      />
                    </Card>
                  </Col>
                )) 
            </Row>*/}
          </div>
          <div className="h-4" />
          <Divider>
            <LogoText className="text-xl">Sustainability Efforts</LogoText>
          </Divider>
          <div className="flex-wrap flex items-center md:px-10">
            <div className="flex-[1] px-4 text-center">
              <LogoText>Plant Species</LogoText>
              <br />
              <div className="my-2 flex items-center justify-center gap-4">
                <PiPlant className="text-2xl text-green-200" />
                <CountUp end={speciesCount} duration={3} className="text-3xl font-bold text-green-400" />
                <br />
              </div>
              <Button type="link" icon={<MdArrowForward />} onClick={() => navigate(`/discover/park/${parkId}`)}>
                Find Out More
              </Button>
            </div>
            <div className="flex-[1] px-4 items-center text-center">
              <LogoText>Decarbonization Goals</LogoText>
              <div className="text-secondary h-20 md:h-20 flex items-center justify-center">No data yet.</div>
            </div>
          </div>
          <div className="w-full md:flex p-4">
            <LogoText className="text-xl font-bold md:font-semibold md:w-full text-center">Featured Events</LogoText>
          </div>
          {/* <div className="h-8" /> */}
          <div className="bg-green-50 h-64 flex items-center justify-center px-4">
            <div className="text-secondary">Coming soon</div>
          </div>
        </div>
      ),
    },
    {
      key: 'information',
      label: (
        <div className="flex items-center">
          <BsInfoCircleFill className="text-xl mr-2" />
          Information
        </div>
      ),
      children: park && (
        <div className="px-4">
          <div className="-mt-4" />
          <Divider>
            <LogoText className="text-lg font-bold md:font-semibold md:py-2 md:m-0 mb-2">Opening Hours</LogoText>
          </Divider>
          {park && openingHours && closingHours && (
            <Descriptions column={1} bordered size="small">
              {openingHours &&
                closingHours &&
                daysOfWeek.map((day, index) => (
                  <Descriptions.Item label={day} key={index} labelStyle={{ width: '15vw' }}>
                    <Tag bordered={false}>{openingHours[index]}</Tag> - <Tag bordered={false}>{closingHours[index]}</Tag>
                  </Descriptions.Item>
                ))}
            </Descriptions>
          )}
          <br />
          <Divider>
            <div className="flex items-center gap-1 md:py-2 md:m-0 mb-2">
              <FaLocationDot className="text-highlightGreen-200 text-2xl" />
              <LogoText className="text-lg font-bold  md:font-semibold">Address & Contact</LogoText>
            </div>
          </Divider>
          <div className="md:flex">
            <div className="flex-[1] md:flex md:flex-col md:justify-center md:px-4 md:h-96">
              {park.address && (
                <Typography.Paragraph>
                  <strong>Address:</strong> {park.address}
                </Typography.Paragraph>
              )}
              {park.contactNumber && (
                <Typography.Paragraph>
                  <strong>Contact:</strong> {park.contactNumber}
                </Typography.Paragraph>
              )}
            </div>
            <div className="flex-[1] bg-green-50 h-72 rounded-xl overflow-hidden md:h-96">
              <MapContainer
                key="park-map-tab"
                center={[1.287953, 103.851784]}
                zoom={11}
                className="leaflet-mapview-container h-full w-full"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={park?.name} color="transparent" />
              </MapContainer>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'sustainability',
      label: (
        <div className="flex items-center">
          <FaLeaf className="text-xl mr-2" />
          Sustainability
        </div>
      ),
      children:<Empty description={'Sustanability Information Coming Soon'}></Empty>,
    },
  ];

  const handleBackClick = () => {
    navigate('/select-park');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!park) {
    return <div>Park not found</div>;
  }

  return (
    <div className="md:h-screen md:overflow-y-scroll">
      {/* <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBackClick}
        className="mb-4"
      >

      </Button> */}
      <div className="w-full gap-4 md:h-full">
        <div className="bg-gray-200 rounded-b-3xl overflow-hidden md:rounded-none">
          {park.images && park.images.length > 0 ? (
            <Carousel {...carouselSettings}>
              {park.images.map((image, index) => (
                <div key={index}>
                  <img
                    src={image}
                    alt={`Species ${index + 1}`}
                    style={{
                      width: '100%',
                      objectFit: 'cover',
                    }}
                    className="h-96 md:h-[16rem]"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div
              style={{
                width: '100%',
                // height: '300px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              No images available
            </div>
          )}
        </div>
        <div className="py-4 md:p-0 md:pb-8 md:overflow-x-auto md:px-0">
          <div className="items-start px-4">
            <div className="">
              <div className="w-full md:flex">
                <div>
                  <LogoText className="text-3xl font-bold md:font-semibold md:py-2 md:w-full">{park.name}</LogoText>
                  <div className="w-10 h-[5px] bg-mustard-400 mb-4"></div>
                </div>
              </div>
              <Typography.Paragraph
                ellipsis={{
                  rows: 3,
                  expandable: true,
                  symbol: 'more',
                }}
              >
                {park.description}
              </Typography.Paragraph>
              {openingHours && closingHours && (
                <div className='flex gap-2 items-center'>
                  <div className='text-sm'>Hours Today:</div>
                  <div>
                    <Tag bordered={false}>{openingHours[todayIndex]}</Tag> - <Tag bordered={false}>{closingHours[todayIndex]}</Tag>
                  </div>
                </div>
              )}
              {/* <div className="mb-4 hidden md:block">
                <Tag color={park.parkStatus === 'OPEN' ? 'green' : 'red'}>{park.parkStatus}</Tag>
              </div> */}
            </div>
          </div>
          <Tabs
            defaultActiveKey={'whatToDo'}
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="px-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorViewParkDetails;
