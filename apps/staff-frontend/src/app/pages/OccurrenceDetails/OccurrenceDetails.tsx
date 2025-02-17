import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty } from 'antd';
import InformationTab from './components/InformationTab';
import { FiSun } from 'react-icons/fi';
import { MdOutlineTerrain, MdEco } from 'react-icons/md';
import { FaTint } from 'react-icons/fa';
import moment from 'moment';
import AboutTab from './components/AboutTab';
import ActivityLogs from './components/ActivityLogs';
import StatusLogs from './components/StatusLogs';
import QRTab from './components/QRTab';
import { LightTypeEnum, SoilTypeEnum, ConservationStatusEnum, getOccurrenceById, OccurrenceStatusEnum } from '@lepark/data-access';
import { WiDaySunny, WiDayCloudy, WiNightAltCloudy } from 'react-icons/wi';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictOccurrence } from '../../hooks/Occurrences/useRestrictOccurrence';
import { useCallback, useEffect, useState } from 'react';
import OccurrenceMapTab from './components/OccurrenceMapTab';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const OccurrenceDetails = () => {
  const { occurrenceId } = useParams<{ occurrenceId: string }>();
  const { occurrence, species, loading, zone, updateOccurrence } = useRestrictOccurrence(occurrenceId);
  const navigate = useNavigate();

  const refreshOccurrence = useCallback(async () => {
    if (occurrenceId) {
      try {
        const occurrenceResponse = await getOccurrenceById(occurrenceId);
        if (occurrence) {
          updateOccurrence(occurrenceResponse.data);
          // console.log('Occurrence status updated:', occurrenceResponse.data);
        }
      } catch (error) {
        console.error('Error refreshing occurrence:', error);
      }
    }
  }, [occurrenceId, occurrence, updateOccurrence]);

  const getStatusTag = (status?: string) => {
    switch (status) {
      case OccurrenceStatusEnum.HEALTHY:
        return (
          <Tag color="green" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(OccurrenceStatusEnum.HEALTHY)}
          </Tag>
        );
      case OccurrenceStatusEnum.MONITOR_AFTER_TREATMENT:
        return (
          <Tag color="yellow" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(OccurrenceStatusEnum.MONITOR_AFTER_TREATMENT)}
          </Tag>
        );
      case OccurrenceStatusEnum.NEEDS_ATTENTION:
        return (
          <Tag color="orange" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(OccurrenceStatusEnum.NEEDS_ATTENTION)}
          </Tag>
        );
      case OccurrenceStatusEnum.URGENT_ACTION_REQUIRED:
        return (
          <Tag color="red" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(OccurrenceStatusEnum.URGENT_ACTION_REQUIRED)}
          </Tag>
        );
      case OccurrenceStatusEnum.REMOVED:
        return <Tag bordered={false}>{formatEnumLabelToRemoveUnderscores(OccurrenceStatusEnum.REMOVED)}</Tag>;
      default:
        return <Tag bordered={false}>{status ? formatEnumLabelToRemoveUnderscores(status) : ''}</Tag>;
    }
  };

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

  if (!occurrence) {
    return null; // This will handle cases where the occurrence is not found or user doesn't have access
  }

  const descriptionsItems = [
    {
      key: 'occurrenceSpecies',
      label: 'Species',
      children: species ? species.speciesName : 'Loading...',
    },
    {
      key: 'occurrenceStatus',
      label: 'Status',
      children: getStatusTag(occurrence?.occurrenceStatus),
    },
    {
      key: 'dateObserved',
      label: 'Last Observed',
      children: moment(occurrence?.dateObserved).fromNow(),
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: occurrence ? <InformationTab occurrence={occurrence} /> : <p>Loading occurrence data...</p>,
    },
    {
      key: 'location',
      label: 'Location',
      children: occurrence && zone ? <OccurrenceMapTab occurrence={occurrence} zone={zone} /> : <p>Loading occurrence data...</p>,
    },
    {
      key: 'about',
      label: 'Species',
      children: species && occurrence ? <AboutTab species={species} occurrence={occurrence} /> : <p>Loading Species data...</p>,
    },
    {
      key: 'activityLogs',
      label: 'Activity Logs',
      children: occurrence && <ActivityLogs occurrence={occurrence} />,
    },
    {
      key: 'statusLogs',
      label: 'Status Logs',
      children: occurrence && <StatusLogs occurrence={occurrence} onStatusLogCreated={refreshOccurrence} />,
    },
    {
      key: 'qr',
      label: 'QR',
      children: occurrence ? <QRTab occurrence={occurrence} /> : <p>Loading occurrence data...</p>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Occurrence Management',
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: occurrence?.title ? occurrence?.title : 'Details',
      pathKey: `/occurrences/${occurrence?.id}`,
      isCurrent: true,
    },
  ];

  const getSoilMoistureInfo = (value: number) => {
    if (value <= 30) return { text: 'Low', icon: <FaTint className="text-3xl mt-2 text-blue-300" /> };
    if (value <= 60) return { text: 'Medium', icon: <FaTint className="text-3xl mt-2 text-blue-500" /> };
    return { text: 'High', icon: <FaTint className="text-3xl mt-2 text-blue-700" /> };
  };

  const getLightTypeInfo = (lightType: LightTypeEnum) => {
    switch (lightType) {
      case LightTypeEnum.FULL_SUN:
        return {
          text: formatEnumLabelToRemoveUnderscores(LightTypeEnum.FULL_SUN),
          icon: <WiDaySunny className="text-3xl mt-2 text-yellow-500" />,
        };
      case LightTypeEnum.PARTIAL_SHADE:
        return {
          text: formatEnumLabelToRemoveUnderscores(LightTypeEnum.PARTIAL_SHADE),
          icon: <WiDayCloudy className="text-3xl mt-2 text-yellow-300" />,
        };
      case LightTypeEnum.FULL_SHADE:
        return {
          text: formatEnumLabelToRemoveUnderscores(LightTypeEnum.FULL_SHADE),
          icon: <WiNightAltCloudy className="text-3xl mt-2 text-gray-500" />,
        };
      default:
        return { text: 'Unknown', icon: <FiSun className="text-3xl mt-2" /> };
    }
  };

  const getSoilTypeText = (soilType: SoilTypeEnum) => {
    return formatEnumLabelToRemoveUnderscores(soilType);
  };

  const getConservationStatusText = (status: ConservationStatusEnum) => {
    return formatEnumLabelToRemoveUnderscores(status);
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="md:flex w-full gap-4">
              <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
                {occurrence?.images && occurrence.images.length > 0 ? (
                  <Carousel style={{ maxWidth: '100%' }}>
                    {occurrence?.images?.map((url) => (
                      <div key={url}>
                        <div
                          style={{
                            backgroundImage: `url('${url}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: 'white',
                            overflow: 'hidden',
                          }}
                          className="h-64 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    <Empty description="No Image" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex-col flex">
                <LogoText className="text-2xl py-2 m-0">{occurrence?.title}</LogoText>
                <Descriptions items={descriptionsItems} column={1} size="small" />

                <div className="flex h-24 w-full gap-2 mt-auto">
                  {species ? (
                    <>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        {getSoilMoistureInfo(species.soilMoisture).icon}
                        <p className="text-xs mt-2">{getSoilMoistureInfo(species.soilMoisture).text}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        {getLightTypeInfo(species.lightType).icon}
                        <p className="text-xs mt-2">{getLightTypeInfo(species.lightType).text}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        <MdOutlineTerrain className="text-3xl mt-2" />
                        <p className="text-xs mt-2">{getSoilTypeText(species.soilType)}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        <MdEco className="text-3xl mt-2" />
                        <p className="text-xs mt-2">{getConservationStatusText(species.conservationStatus)}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 h-full w-full rounded-lg flex justify-center items-center text-green-600">
                      <p>Species data not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Tabs
              centered
              defaultActiveKey="information"
              items={tabsItems}
              renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
              className="mt-4"
            />
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceDetails;
