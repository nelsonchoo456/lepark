import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { createPark, getParkById, ParkResponse, StaffResponse, StaffType, StringIdxSig, updatePark } from '@lepark/data-access';
import { Button, Card, Form, message, notification, Popconfirm, Space } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import node_image from '../../assets/mapFeatureManager/line.png';
import polygon_image from '../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../assets/mapFeatureManager/edit.png';
import MapFeatureManagerEdit from '../../components/map/MapFeatureManagerEdit';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const ParkEditMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const [createdData, setCreatedData] = useState<ParkResponse>();
  const [park, setPark] = useState<ParkResponse>();
  const [polygon, setPolygon] = useState<LatLng[][]>([]); // original polygon
  const [editPolygon, setEditPolygon] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!id) return;

    if (!(user?.role === StaffType.MANAGER && user?.parkId === parseInt(id)) && user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to edit the details of this park!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }

    const fetchData = async () => {
      try {
        const parkRes = await getParkById(parseInt(id));
        if (parkRes.status === 200) {
          const parkData = parkRes.data;
          setPark(parkData)
          setPolygon(parkData.geom.coordinates); // AARON LOOK AT THIS CHANGE TO ZONE
          // resetEditPolygon(parkData.geom.coordinates)
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Error',
            description: 'An error occurred while fetching the park details.',
          });
          notificationShown.current = true;
        }
        setPolygon([]);
        navigate('/');
      }
    };
    fetchData();
  }, [id, user]);

  // Form Values

  const handleSubmit = async () => {
    if (!park) return;
    try {
      const finalData: any = {};

      if (editPolygon && editPolygon[0] && editPolygon[0][0]) {
        const polygonData = latLngArrayToPolygon(editPolygon[0][0]);
        finalData.geom = polygonData;
      } else {
        throw new Error('Please draw Park boundaries on the map.');
      }
      
      const response = await updatePark(park.id, finalData);
      if (response.status === 200) {
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Park Boundaries.  Redirecting to Park details page...',
        });
        setTimeout(() => {
          navigate(`/park/${park.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'A park with this name already exists') {
          messageApi.open({
            type: 'error',
            content: 'A park with this name already exists. Please choose a different name.',
          });
        } else {
          messageApi.open({
            type: 'error',
            content: error.message || 'Unable to save changes to Park. Please try again later.',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the park.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Park Management',
      pathKey: '/park',
      isMain: true,
    },
    {
      title: park?.name ? park?.name : 'Details',
      pathKey: `/park/${park?.id}`,
    },
    {
      title: 'Edit Boundaries',
      pathKey: `/park/${park?.id}/edit-map`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <>
          <div className="">
            <div className="font-semibold">Instructions: </div>
            <Space>
              <img src={node_image} alt="node" height={'16px'} width={'16px'} /> - Draw Paths with the line tool
            </Space>
            <br />
            <Space>
              <img src={polygon_image} alt="node" height={'16px'} width={'16px'} /> - Draw Boundaries with the polygon tool
            </Space>
            <br />
            <Space>
              <img src={edit_image} alt="polygon-edit" height={'16px'} width={'16px'} /> - Edit Paths and Boundaries
            </Space>
          </div>
          <div
            style={{
              height: '60vh',
              zIndex: 1,
            }}
            className="my-4 rounded overflow-hidden"
          >
            <MapContainer
              center={[1.287953, 103.851784]}
              zoom={11}
              className="leaflet-mapview-container"
              style={{ height: '60vh', width: '100%' }}
              key="park-create"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapFeatureManagerEdit
                polygon={polygon}
                setPolygon={setPolygon}
                editPolygon={editPolygon}
                setEditPolygon={setEditPolygon}
                lines={lines}
                setLines={setLines}
              />
            </MapContainer>
          </div>
        </>
        <div className='flex justify-center gap-2'>
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/park/${park?.id}`)}>
            <Button>
              Cancel
            </Button>
          </Popconfirm>
          
          <Button type="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkEditMap;
