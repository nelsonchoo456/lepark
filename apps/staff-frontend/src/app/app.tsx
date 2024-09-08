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
import OccurenceList from './pages/Occurence/OccurenceList';
import OccurenceCreate from './pages/Occurence/OccurenceCreate';
import OccurenceDetails from './pages/OccurenceDetails/OccurenceDetails';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ResetPassword/ResetPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import StaffProfile from './pages/Profile/StaffProfile';
import StaffManagementPage from './pages/StaffManagement/StaffManagement';
import CreateStaff from './pages/StaffManagement/CreateStaff';
import ViewStaffDetails from './pages/StaffManagement/ViewStaffDetails';

export function App() {
  return (
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
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainLanding />} />
            <Route path="/map" element={<MapPage />} />

            <Route path="/occurence">
              <Route index element={<OccurenceList />} />
              <Route path=":occurenceId" element={<OccurenceDetails />} />
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
  );
}

export default App;
