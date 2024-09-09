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
// import ProfilePage from './pages/Profile/Profile';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ResetPassword/ResetPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import StaffProfile from './pages/Profile/StaffProfile';
import StaffManagementPage from './pages/StaffManagement/StaffManagement';
import ParkList from './pages/Park/ParkList';
import ParkCreate from './pages/Park/ParkCreate';
import ParkDetails from './pages/ParkDetails/ParkDetails';
import ActivityLogDetails from './pages/OccurrenceDetails/components/ActivityLogsDetails';
import CreateStaff from './pages/StaffManagement/CreateStaff';
import { StaffAuthWrapper } from '@lepark/common-ui';
import { ProtectedRoute } from '@lepark/common-ui';
import ViewStaffDetails from './pages/StaffManagement/ViewStaffDetails';
import ParkEdit from './pages/ParkEdit/ParkEdit';

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
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

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

              <Route path="/occurrences">
                <Route index element={<OccurrenceList />} />
                <Route path=":occurrenceId" element={<OccurrenceDetails />} />
              </Route>

              <Route path="/park">
                <Route index element={<ParkList />} />
                <Route path="create" element={<ParkCreate />} />
                <Route path=":id" element={<ParkDetails />} />
                <Route path=":id/edit" element={<ParkEdit />} />
              </Route>

              <Route path="/profile" element={<StaffProfile />} />
              <Route path="/staff-management">
                <Route index element={<StaffManagementPage />} />
                <Route path=":staffId" element={<ViewStaffDetails />} />
                <Route path="create-staff" element={<CreateStaff />} />
              </Route>

              <Route path="/species" element={<SpeciesPage />} />
              <Route path="/species/create" element={<CreateSpecies />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </StaffAuthWrapper>
  );
}

export default App;
