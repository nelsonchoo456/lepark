// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLanding from './pages/MainLanding/MainLanding';
import { ConfigProvider } from 'antd';
import MapPage from './pages/Map/MapPage';
import SpeciesPage from './pages/Species/SpeciesPage';
import CreateSpecies from './pages/Species/CreateSpecies';
import MainLayout from './components/main/MainLayout';
import Login from './pages/Login/Login';
import OccurrenceList from './pages/Occurrence/OccurrenceList';
import OccurrenceCreate from './pages/Occurrence/OccurrenceCreate';
import OccurrenceDetails from './pages/OccurrenceDetails/OccurrenceDetails';
import ProfilePage from './pages/Profile/StaffProfile';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ResetPassword/ResetPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import StaffProfile from './pages/Profile/StaffProfile';
import StaffManagementPage from './pages/StaffManagement/StaffManagement';
import ParkList from './pages/Park/ParkList';
import ParkCreate from './pages/Park/ParkCreate';
import ParkDetails from './pages/ParkDetails/ParkDetails';
import ActivityLogDetails from './pages/OccurrenceDetails/components/ActivityLogsDetails';
import StatusLogDetails from './pages/OccurrenceDetails/components/StatusLogsDetails';
import CreateStaff from './pages/StaffManagement/CreateStaff';
import { StaffAuthWrapper } from '@lepark/common-ui';
import { ProtectedRoute } from '@lepark/common-ui';
import { RoleProtectedRoute } from '@lepark/common-ui';
import ViewStaffDetails from './pages/StaffManagement/ViewStaffDetails';
import ParkEdit from './pages/ParkEdit/ParkEdit';
import OccurrenceEdit from './pages/OccurrenceEdit/OccurrenceEdit';
import ViewEditSpecies from './pages/Species/ViewEditSpecies';
import ViewSpeciesDetails from './pages/Species/ViewSpeciesDetails';
import PlantTaskList from './pages/PlantTask/PlantTaskList';
import ZoneList from './pages/Zone/ZoneList';
import ZoneDetails from './pages/ZoneDetails/ZoneDetails';
import ZoneCreate from './pages/ZoneCreate/ZoneCreate';
import PageNotFound from './pages/PageNotFound.tsx/PageNotFound';
import Settings from './pages/Settings/Settings';
import AttractionList from './pages/Attraction/AttractionList';
import AttractionCreate from './pages/Attraction/AttractionCreate';
import AttractionDetails from './pages/AttractionDetails/AttractionDetails';
//import AttractionEdit from './pages/Attraction/AttractionEdit';
import HubList from './pages/Hub/HubList';
import { StaffType } from '@lepark/data-access';
import ViewHubDetails from './pages/Hub/ViewHubDetails';
import HubCreate from './pages/Hub/HubCreate';
import ZoneEdit from './pages/ZoneEdit/ZoneEdit';
import AttractionEdit from './pages/AttractionEdit/AttractionEdit';
import ParkEditMap from './pages/ParkEditMap/ParkEditMap';
import ParksMap from './pages/ParksMap/ParksMap';
import AssetCreate from './pages/Asset/AssetCreate';
import AssetDetails from './pages/Asset/AssetDetails';
import AssetEdit from './pages/Asset/AssetEdit';
import SensorList from './pages/Sensor/SensorList';
import FacilityList from './pages/Facility/FacilityList';
import FacilityCreate from './pages/Facility/FacilityCreate';
import ViewFacilityDetails from './pages/Facility/ViewFacilityDetails';
import ViewSensorDetails from './pages/Sensor/ViewSensorDetails';
import SensorEdit from './pages/Sensor/SensorEdit';
import OccurrenceEditMap from './pages/OccurrenceEditMap/OccurrenceEditMap';
import AttractionEditMap from './pages/AttractionEditMap/AttractionEditMap';
import ZoneEditMap from './pages/ZoneEditMap/ZoneEditMap';
import EventList from './pages/Event/EventList';
import FacilityEdit from './pages/Facility/FacilityEdit';
import EventDetails from './pages/EventDetails/EventDetails';
import MaintenanceTask from './pages/MaintenanceTask/MaintenanceTask';
import EventCreate from './pages/Event/EventCreate';
import EventEdit from './pages/EventEdit/EventEdit';
import FacilityEditMap from './pages/FacilityEditMap/FacilityEditMap';
import CreatePlantTask from './pages/PlantTask/CreatePlantTask';
import PlantTaskEdit from './pages/PlantTaskEdit/PlantTaskEdit';

import HubEdit from './pages/Hub/HubEdit';

import DecarbonizationAreaDetails from './pages/DecarbonizationAreaDetails/DecarbonizationAreaDetails';
import CreateDecarbonizationArea from './pages/DecarbonizationArea/CreateDecarbonizationArea';
import DecarbonizationAreaEditMap from './pages/DecarbonizationAreaEditMap/DecarbonizationAreaEditMap';
import DecarbonizationAreaEdit from './pages/DecarbonizationAreaEdit/DecarbonizationAreaEdit';
import DecarbonizationAreaList from './pages/DecarbonizationArea/DecarbonizationAreaList';
import SensorCreate from './pages/Sensor/SensorCreate';
import AssetListSummary from './pages/Asset/AssetListSummary';
import DecarbonizationAreaChart from './pages/DecarbonizationArea/DecarbonizationAreaChart';
import PromotionList from './pages/Promotion/PromotionList';
import PromotionCreate from './pages/Promotion/ParkPromotionCreate';
import ParkPromotionCreate from './pages/Promotion/ParkPromotionCreate';
import PromotionDetails from './pages/PromotionDetails/PromotionDetails';
import ArchivedPromotionList from './pages/Promotion/ArchivedPromotionList';
import FAQList from './pages/FAQ/FAQList';
import FAQCreate from './pages/FAQ/FAQCreate';
import { App as AntdApp } from 'antd';
import FAQView from './pages/FAQ/FAQView';
import FAQEdit from './pages/FAQ/FAQEdit';
export function App() {
  return (
    <AntdApp>
    <StaffAuthWrapper>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: '#6da696', // green.500
            borderRadius: 5,
            colorTextBase: '#000000',
            fontSize: 14,

            // Alias Token
          },
          components: {
            Menu: {
              itemBg: '#ffffff',
              itemHoverBg: '#e6f0ed', // green.50
              itemSelectedBg: '#fff', // green.100
              itemSelectedColor: '#558f7f', // green.500
            },
            Table: {
              headerBg: '#e6f0ed', // green.50
            },
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              element={
                <ProtectedRoute redirectTo="/login">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Nest all protected routes here */}
              <Route path="/" element={<MainLanding />} />
              <Route path="/map" element={<MapPage />} />

              {/* Occurrence Routes */}
              <Route path="/occurrences">
                <Route index element={<OccurrenceList />} />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.BOTANIST, StaffType.ARBORIST]}
                        redirectTo="/"
                      />
                      <OccurrenceCreate />
                    </>
                  }
                />
                <Route path=":occurrenceId" element={<OccurrenceDetails />} />
                <Route
                  path=":occurrenceId/edit"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.BOTANIST, StaffType.ARBORIST]}
                        redirectTo="/"
                      />
                      <OccurrenceEdit />
                    </>
                  }
                />
                <Route
                  path=":occurrenceId/edit-location"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.BOTANIST, StaffType.ARBORIST]}
                        redirectTo="/"
                      />
                      <OccurrenceEditMap />
                    </>
                  }
                />
                <Route path=":occurrenceId/activitylog/:activityLogId" element={<ActivityLogDetails />} />
                <Route path=":occurrenceId/statuslog/:statusLogId" element={<StatusLogDetails />} />
              </Route>

              {/* Park Routes */}
              <Route path="/park">
                <Route
                  index
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN]} redirectTo="/" />
                      <ParkList />
                    </>
                  }
                />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN]} redirectTo="/" />
                      <ParkCreate />
                    </>
                  }
                />
                <Route path=":id" element={<ParkDetails />} />
                <Route
                  path=":id/edit"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT]}
                        redirectTo="/"
                      />
                      <ParkEdit />
                    </>
                  }
                />
                <Route
                  path="map"
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN]} redirectTo="/" />
                      <ParksMap />
                    </>
                  }
                />
                <Route
                  path=":id/edit-map"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT]}
                        redirectTo="/"
                      />
                      <ParkEditMap />
                    </>
                  }
                />
              </Route>

              {/* Zone Routes */}
              <Route path="/zone">
                <Route index element={<ZoneList />} />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT]}
                        redirectTo="/"
                      />
                      <ZoneCreate />
                    </>
                  }
                />
                <Route path=":id" element={<ZoneDetails />} />
                <Route
                  path=":id/edit"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT]}
                        redirectTo="/"
                      />
                      <ZoneEdit />
                    </>
                  }
                />
                <Route
                  path=":id/edit-map"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT]}
                        redirectTo="/"
                      />
                      <ZoneEditMap />
                    </>
                  }
                />
              </Route>

              {/* Task Routes */}
              <Route path="/plant-tasks">
                <Route index element={<PlantTaskList />} />
                <Route path="create" element={<CreatePlantTask />} />
                <Route path=":plantTaskId/edit" element={<PlantTaskEdit />} />
                {/* <Route path=":plantTaskId" element={<PlantTaskDetails />} /> */}
              </Route>

              <Route path="/maintenance-tasks">
                <Route index element={<MaintenanceTask />} />
              </Route>

              {/* Settings Routes */}
              <Route path="/settings" element={<Settings />} />

              {/* Profile Routes */}
              <Route path="/profile" element={<StaffProfile />} />

              {/* Staff Management Routes */}
              <Route path="/staff-management">
                <Route
                  index
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/" />
                      <StaffManagementPage />
                    </>
                  }
                />
                <Route path=":staffId" element={<ViewStaffDetails />} />
                <Route
                  path="create-staff"
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/" />
                      <CreateStaff />
                    </>
                  }
                />
              </Route>

              {/* Species Routes */}
              <Route path="/species">
                <Route index element={<SpeciesPage />} />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.BOTANIST, StaffType.ARBORIST]}
                        redirectTo="/"
                      />
                      <CreateSpecies />
                    </>
                  }
                />
                <Route path=":speciesId" element={<ViewSpeciesDetails />} />
                <Route
                  path=":speciesId/edit"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.BOTANIST, StaffType.ARBORIST]}
                        redirectTo="/"
                      />
                      <ViewEditSpecies />
                    </>
                  }
                />
              </Route>

              {/* Attraction Routes */}
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.PARK_RANGER]} redirectTo="/" />
                }
              >
                <Route path="/attraction">
                  <Route index element={<AttractionList />} />
                  <Route element={<RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/attraction" />}>
                    <Route path="create" element={<AttractionCreate />} />
                    <Route path=":id/edit" element={<AttractionEdit />} />
                    <Route path=":id/edit-map" element={<AttractionEditMap />} />
                  </Route>
                  <Route path=":id" element={<AttractionDetails />} />
                </Route>
              </Route>

              {/* Event Routes */}
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.PARK_RANGER]} redirectTo="/" />
                }
              >
                <Route path="/event">
                  <Route index element={<EventList />} />
                  <Route element={<RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/event" />}>
                    <Route path="create" element={<EventCreate />} />
                    <Route path=":id/edit" element={<EventEdit />} />
                  </Route>
                  <Route path=":id" element={<EventDetails />} />
                </Route>
              </Route>

              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      StaffType.SUPERADMIN,
                      StaffType.MANAGER,
                      StaffType.ARBORIST,
                      StaffType.BOTANIST,
                      StaffType.VENDOR_MAANGER,
                    ]}
                    redirectTo="/"
                  />
                }
              >
                {/* Hub Routes */}
                <Route path="/hubs">
                  <Route index element={<HubList />} />
                  <Route path=":hubId" element={<ViewHubDetails />} />

                  <Route path="create" element={<HubCreate />} />
                  <Route path=":hubId/edit" element={<HubEdit />} />
                  {/* <Route path="edit"/> */}
                </Route>
              </Route>

              {/* Facility Routes */}
              <Route path="/facilities">
                <Route index element={<FacilityList />} />
                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT, StaffType.PARK_RANGER]}
                      redirectTo="/"
                    />
                  }
                >
                  <Route path="create" element={<FacilityCreate />} />
                  <Route path=":facilityId/edit" element={<FacilityEdit />} />
                  <Route path=":facilityId/edit-location" element={<FacilityEditMap />} />
                </Route>
                <Route path=":facilityId" element={<ViewFacilityDetails />} />
              </Route>

              {/* Park Asset Routes */}
              <Route path="/parkasset">
                <Route index element={<AssetListSummary />} />
                <Route path="create" element={<AssetCreate />} />
                <Route path=":assetId" element={<AssetDetails />} />
                <Route path=":assetId/edit" element={<AssetEdit />} />
              </Route>

              {/* Sensor Routes */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      StaffType.SUPERADMIN,
                      StaffType.MANAGER,
                      StaffType.ARBORIST,
                      StaffType.BOTANIST,
                      StaffType.VENDOR_MAANGER,
                    ]}
                    redirectTo="/"
                  />
                }
              >
                <Route path="/sensor">
                  <Route index element={<SensorList />} />
                  <Route path=":sensorId" element={<ViewSensorDetails />} />
                  <Route path="create" element={<SensorCreate />} />
                  <Route path=":sensorId/edit" element={<SensorEdit />} />
                </Route>
              </Route>

              <Route path="/decarbonization-area">
                <Route index element={<DecarbonizationAreaList />} />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.ARBORIST, StaffType.BOTANIST]}
                        redirectTo="/"
                      />
                      <CreateDecarbonizationArea />
                    </>
                  }
                />
                <Route path="chart" element={<DecarbonizationAreaChart />} />
                <Route path=":decarbonizationAreaId" element={<DecarbonizationAreaDetails />} />
                <Route
                  path=":id/edit-map"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.ARBORIST, StaffType.BOTANIST]}
                        redirectTo="/"
                      />
                      <DecarbonizationAreaEditMap />
                    </>
                  }
                />
                <Route
                  path=":id/edit"
                  element={
                    <>
                      <RoleProtectedRoute
                        allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.ARBORIST, StaffType.BOTANIST]}
                        redirectTo="/"
                      />
                      <DecarbonizationAreaEdit />
                    </>
                  }
                />
              </Route>

              <Route path="/promotion">
                <Route index element={<PromotionList />} />
                <Route path="archived" element={<ArchivedPromotionList />} />
                <Route
                  path="create"
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/" />
                      <ParkPromotionCreate />
                    </>
                  }
                />
                <Route
                  path=":promotionId"
                  element={
                    <>
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/" />
                      <PromotionDetails />
                    </>
                  }
                />
              </Route>

              <Route path="/faq">
                <Route index element={<FAQList />} />
                <Route path="create" element={<FAQCreate />} />
                <Route path=":faqId" element={<FAQView />} />
                <Route path=":faqId/edit" element={<FAQEdit />} />
              </Route>

              {/* Catch-all for 404 */}
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </StaffAuthWrapper>
    </AntdApp>
  );
}

export default App;
