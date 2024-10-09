// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import NxWelcome from './nx-welcome';
import MainLanding from './pages/MainLanding/MainLanding';
import MapPage from './pages/MapPage/MapPage';
import MainLayout from './components/main/MainLayout';
import DecarbViewDetails from './pages/Decarb/DecarbViewDetails';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Register from './pages/Register/Register';
import { ProtectedRoute, VisitorAuthWrapper } from '@lepark/common-ui';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Payment from './pages/Payment/Payment';
import OccurrenceDetails from './pages/OccurrenceDetails/OccurrenceDetails';
// import ActivityLogDetails from './pages/OccurrenceDetails/components/ActivityLogsDetails';
import Discover from './pages/Taxonomy/Discover';
import ViewSpeciesDetails from './pages/Taxonomy/ViewSpecies';
import SelectParkPage from './park-context/SelectParkPage';
import { ParkProvider } from './park-context/ParkContext';
import VerifyUser from './pages/VerifyUser/VerifyUser';
import EditProfile from './pages/Profile/EditProfile';
import DiscoverPerPark from './pages/Taxonomy/DiscoverPerPark';
import AttractionsPerPark from './pages/Attractions/AttractionsPerPark';
import VisitorViewAttractionDetails from './pages/Attractions/VisitorViewAttractionDetails';
import ParkDetails from './pages/ParkDetails/ParkDetails';
import VisitorParkViewDetails from './pages/Park/VisitorParkViewDetails';
import DecarbViewAll from './pages/Decarb/DecarbViewAll';
import PromotionViewAll from './pages/Promotions/PromotionViewAll';
import PromotionViewDetails from './pages/Promotions/PromotionViewDetails';
import DecarbViewAllMap from './pages/Decarb/DecarbViewAllMap';
export function App() {
  return (
    <VisitorAuthWrapper>
      <ParkProvider>
        <ConfigProvider
          theme={{
            token: {
              // Seed Token
              colorPrimary: '#6da696', // Green
              borderRadius: 5,

              // Alias Token
            },
            components: {
              Button: {
                colorPrimary: '#6da696', // Green
                borderRadius: 5,

                // Alias Token
              },
            },
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/visitor-reset-password" element={<ResetPassword />} />
              <Route path="/verify-user" element={<VerifyUser />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<MainLanding />} />
                <Route path="/select-park" element={<SelectParkPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route
                  path="/profile"
                  element={
                    //<ProtectedRoute redirectTo="/login">
                    <Profile />
                    //</ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <ProtectedRoute redirectTo="/login">
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute redirectTo="/login">
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route path="/park">
                  <Route index element={<SelectParkPage />} />
                  <Route path=":parkId" element={<VisitorParkViewDetails />} />
                </Route>
                <Route path="/occurrence">
                  {/* <Route index element={<OccurrenceList />} /> */}
                  <Route path=":occurrenceId" element={<OccurrenceDetails />} />
                  {/* <Route path="activitylog/:activityLogId" element={<ActivityLogDetails/>}/> */}
                </Route>
                <Route path="/discover">
                  <Route index element={<Discover />} />
                  <Route path=":speciesId" element={<ViewSpeciesDetails />} />
                  <Route path="park/:parkId" element={<DiscoverPerPark />} />
                </Route>
                <Route path="/attractions">
                  <Route path="park/:parkId" element={<AttractionsPerPark />} />
                  <Route path=":attractionId" element={<VisitorViewAttractionDetails />} />
                </Route>
                <Route path="/decarb">
                  <Route index element={<DecarbViewAll />} />
                  <Route path="map-view" element={<DecarbViewAllMap />} />
                  <Route path=":decarbAreaId" element={<DecarbViewDetails />} />
                </Route>
                <Route path="/promotions">
                  <Route index element={<PromotionViewAll/>}/>
                  <Route path=":promotionId" element={<PromotionViewDetails/>}/>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </ParkProvider>
    </VisitorAuthWrapper>
  );
}

export default App;
