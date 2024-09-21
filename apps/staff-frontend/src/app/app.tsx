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
import Task from './pages/Task/Task';
import ZoneList from './pages/ZoneList/ZoneList';
import ZoneDetails from './pages/ZoneDetails/ZoneDetails';
import ZoneCreate from './pages/ZoneCreate/ZoneCreate';
import PageNotFound from './pages/PageNotFound.tsx/PageNotFound';
import Settings from './pages/Settings/Settings';
import HubList from './pages/Hub/HubList';
import { StaffType } from '@lepark/data-access';
import ViewHubDetails from './pages/Hub/ViewHubDetails';
import HubCreate from './pages/Hub/HubCreate';
import AssetList from './pages/Asset/AssetList';
import AssetCreate from './pages/Asset/AssetCreate';
import AssetDetails from './pages/Asset/AssetDetails';
import AssetEdit from './pages/Asset/AssetEdit';
//import SensorList from './pages/Sensor/SensorList';
import SensorCreate from './pages/Sensor/SensorCreate';

export function App() {
  return (
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
                      <RoleProtectedRoute allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER]} redirectTo="/" />
                      <ParkEdit />
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
              </Route>

              {/* Task Routes */}
              <Route path="/task" element={<Task />} />

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
                <Route path="create" element={<CreateSpecies />} />
                <Route path="edit" element={<ViewEditSpecies />} />
                <Route path=":speciesId" element={<ViewSpeciesDetails />} />
              </Route>

              {/* Hub Routes */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT, StaffType.PARK_RANGER]}
                    redirectTo="/"
                  />
                }
              >
                <Route path="/hubs">
                  <Route index element={<HubList />} />
                  <Route path=":hubId" element={<ViewHubDetails />} />
                  <Route path="create" element={<HubCreate />} />
                </Route>
                <Route path="/parkasset">
                  <Route index element={<AssetList />} />
                  <Route path="create" element={<AssetCreate />} />
                  <Route path=":assetId" element={<AssetDetails />} />
                  <Route path="edit/:assetId" element={<AssetEdit />} />
                </Route>
                <Route path="/sensor">

                  <Route path="create" element={<SensorCreate/>} />
                  {/*<Route index element={<SensorList/>} />
                  <Route path=":sensorId" element={<ViewSensorDetails/>} />
                  <Route path="edit/:sensorId" element={<SensorEdit/>} />*/}
                </Route>

              </Route>

              {/* Catch-all for 404 */}
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </StaffAuthWrapper>
  );
}

export default App;
