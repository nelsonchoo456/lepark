import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Typography, Tag, message, Button, Input, Select, DatePicker, Radio } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import moment from 'moment';
import { updateAnnouncementDetails, viewAnnouncementDetails, getParkById } from '@lepark/data-access';
import { AnnouncementResponse, UpdateAnnouncementData, ParkResponse, AnnouncementStatusEnum } from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import { useAuth } from '@lepark/common-ui';
import { StaffType, StaffResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { useRestrictAnnouncements } from '../../hooks/Announcements/useRestrictAnnouncements';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AnnouncementDetails: React.FC = () => {
  const { announcementId } = useParams<{ announcementId: string }>();
  const { announcement, park, loading, refresh } = useRestrictAnnouncements(announcementId);
  const [editedAnnouncement, setEditedAnnouncement] = useState<AnnouncementResponse | null>(null);
  const [inEditMode, setInEditMode] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth<StaffResponse>();

  const canEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER;

  const statusConfig: Record<AnnouncementStatusEnum, { color: string; label: string }> = {
    [AnnouncementStatusEnum.UPCOMING]: { color: 'blue', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.UPCOMING) },
    [AnnouncementStatusEnum.ACTIVE]: { color: 'green', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.ACTIVE) },
    [AnnouncementStatusEnum.EXPIRED]: { color: 'gold', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.EXPIRED) },
    [AnnouncementStatusEnum.INACTIVE]: { color: 'default', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.INACTIVE) },
  };

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      if (!announcementId) return;

      try {
        // setLoading(true);
        const response = await viewAnnouncementDetails(announcementId);
        // setAnnouncement(response.data);
        setEditedAnnouncement(response.data);

        // if (response.data.parkId) {
        //   const parkResponse = await getParkById(response.data.parkId);
        //   setPark(parkResponse.data);
        // }
      } catch (error) {
        console.error('Error fetching announcement details:', error);
        message.error('Failed to fetch announcement details');
      } finally {
        // setLoading(false);
      }
    };

    fetchAnnouncementDetails();
  }, [announcementId]);

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedAnnouncement(announcement);
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedAnnouncement((prev) => {
      if (prev === null) return null;
      if (key === 'startDate' || key === 'endDate') {
        // If value is null, set the corresponding date to null
        if (value === null) {
          return { ...prev, [key]: null };
        }
        // Convert to SGT
        value = dateToSGT(moment(value), key === 'endDate').format();
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const validateInputs = () => {
    if (editedAnnouncement === null) return false;
    const { title, content, startDate, endDate } = editedAnnouncement;
    return title && content && startDate && endDate;
  };

  const dateToSGT = (date: moment.Moment, isEndDate: boolean = false) => {
    return moment.tz(date.format('YYYY-MM-DD'), 'Asia/Singapore')[isEndDate ? 'endOf' : 'startOf']('day');
  };

  const disabledDate = (current: moment.Moment) => {
    const today = moment().tz('Asia/Singapore').startOf('day');

    // Allow selecting the announcement's original dates
    if (inEditMode && announcement) {
      const originalStartDate = moment(announcement.startDate).tz('Asia/Singapore').startOf('day');
      const originalEndDate = moment(announcement.endDate).tz('Asia/Singapore').endOf('day');

      if (current.isSame(originalStartDate, 'day') || current.isSame(originalEndDate, 'day')) {
        return false;
      }
    }

    // Can't select days before today
    return current < today;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      try {
        const updatedAnnouncementData: UpdateAnnouncementData = {
          title: editedAnnouncement?.title,
          content: editedAnnouncement?.content,
          startDate: dateToSGT(moment(editedAnnouncement?.startDate)).format(),
          endDate: dateToSGT(moment(editedAnnouncement?.endDate), true).format(),
          updatedAt: dateToSGT(moment()).format(),
          status: editedAnnouncement?.status,
          parkId: editedAnnouncement?.parkId,
        };
        if (!announcementId) {
          message.error('No announcement ID provided.');
          return;
        }
        if (!updatedAnnouncementData.startDate || !updatedAnnouncementData.endDate) {
          message.error('Please select both start and end dates.');
          return;
        }
        const response = await updateAnnouncementDetails(announcementId, updatedAnnouncementData);
        refresh();
        setInEditMode(false);
        message.success('Announcement updated successfully!');
      } catch (error) {
        console.error(error);
        message.error('Failed to update announcement.');
      }
    } else {
      message.warning('All fields are required.');
    }
  };

  const getDescriptionItems = () => [
    {
      key: 'title',
      label: 'Title',
      children: !inEditMode ? (
        announcement?.title
      ) : (
        <Input value={editedAnnouncement?.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
      ),
    },
    {
      key: 'content',
      label: 'Content',
      children: !inEditMode ? (
        <div style={{ whiteSpace: 'pre-wrap' }}>{announcement?.content}</div>
      ) : (
        <TextArea 
          value={editedAnnouncement?.content} 
          onChange={(e) => handleInputChange('content', e.target.value)} 
          required 
        />
      ),
    },
    {
      key: 'dateRange',
      label: 'Published Dates',
      children: !inEditMode ? (
        `${dateToSGT(moment(announcement?.startDate)).format('DD MMMM YYYY')} - ${dateToSGT(moment(announcement?.endDate), true).format('DD MMMM YYYY')}`
      ) : (
        <RangePicker
          value={[
            editedAnnouncement?.startDate ? dayjs(editedAnnouncement.startDate) : null,
            editedAnnouncement?.endDate ? dayjs(editedAnnouncement.endDate) : null,
          ]}
          disabledDate={(current) => disabledDate(moment(current.toDate()))}
          onChange={(dates, dateStrings) => {
            if (dates) {
              handleInputChange('startDate', dates[0] ? dates[0].toDate() : null);
              handleInputChange('endDate', dates[1] ? dates[1].toDate() : null);
            } else {
              handleInputChange('startDate', null);
              handleInputChange('endDate', null);
            }
          }}
          allowClear={true}
        />
      ),
    },
    {
      key: 'status',
      label: !inEditMode ? 'Status' : 'Inactivate Announcement?',
      children: !inEditMode ? (
        <Tag color={statusConfig[announcement?.status || AnnouncementStatusEnum.INACTIVE].color}>
          {statusConfig[announcement?.status || AnnouncementStatusEnum.INACTIVE].label}
        </Tag>
      ) : (
        <Radio.Group
          options={[
            { label: 'Yes', value: AnnouncementStatusEnum.INACTIVE },
            { label: 'No', value: AnnouncementStatusEnum.ACTIVE },
          ]}
          optionType="button"
          value={
            editedAnnouncement?.status === AnnouncementStatusEnum.INACTIVE ? AnnouncementStatusEnum.INACTIVE : AnnouncementStatusEnum.ACTIVE
          }
          onChange={(e) => {
            const newStatus =
              e.target.value === AnnouncementStatusEnum.INACTIVE
                ? AnnouncementStatusEnum.INACTIVE
                : editedAnnouncement?.status === AnnouncementStatusEnum.INACTIVE
                ? AnnouncementStatusEnum.ACTIVE
                : editedAnnouncement?.status;
            handleInputChange('status', newStatus);
          }}
        />
      ),
    },
    {
      key: 'park',
      label: 'Park',
      children: park ? park.name : 'All Parks',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Announcement Management',
      pathKey: '/announcement',
      isMain: true,
    },
    {
      title: announcement?.title || 'Announcement Details',
      pathKey: `/announcement/${announcement?.id}`,
      isCurrent: true,
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!announcement) {
      return (
        <ContentWrapperDark>
          <PageHeader2 breadcrumbItems={breadcrumbItems} />
          <Card>
            <div>No announcement found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Card>
          <Descriptions
            bordered
            column={1}
            size="middle"
            items={getDescriptionItems()}
            labelStyle={{ width: '30%' }}
            title={
              <div className="w-full flex justify-between">
                {!inEditMode ? (
                  <>
                    <div>Announcement Details</div>
                    {canEdit && <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />}
                  </>
                ) : (
                  <>
                    <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                      Return
                    </Button>
                    <div className="text-secondary">Edit Announcement</div>
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

  return renderContent();
};

export default AnnouncementDetails;
