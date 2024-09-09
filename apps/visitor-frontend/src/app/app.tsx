// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import NxWelcome from './nx-welcome';
import MainLanding from './pages/MainLanding/MainLanding';
import MapPage from './pages/MapPage/MapPage';
import MainLayout from './components/main/MainLayout';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Register from './pages/Register/Register';
import OccurrenceDetails from './pages/OccurrenceDetails/OccurrenceDetails';
// import ActivityLogDetails from './pages/OccurrenceDetails/components/ActivityLogsDetails';
import Discover from './pages/Taxonomy/Discover';
import ViewSpecies from './pages/Taxonomy/ViewSpecies';
import SelectParkPage from './park-context/SelectParkPage';
import { ParkProvider } from './park-context/ParkContext';

export function App() {
  return (
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
            algorithm: true, // Enable algorithm
          },
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainLanding />} />
            <Route path="/select-park" element={<SelectParkPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/occurrence">
              {/* <Route index element={<OccurrenceList />} /> */}
            <Route
              path=":occurrenceId"
              element={<OccurrenceDetails/>}/>
                {/* <Route path="activitylog/:activityLogId" element={<ActivityLogDetails/>}/> */}
            </Route>
            <Route path="/discover" element={<Discover />} />
            <Route path="/taxonomy/view-species" element={<ViewSpecies />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
    </ParkProvider>
  );
}

export default App;
