// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLanding from './pages/MainLanding/MainLanding';
import { ConfigProvider } from 'antd';
import MapPage from './pages/Map/MapPage';
import MainLayout from './components/main/MainLayout';
import Login from './pages/Login/Login';
import OccurenceList from './pages/Occurence/OccurenceList';
import OccurenceCreate from './pages/Occurence/OccurenceCreate';
import StaffProfile from './pages/StaffProfile';
import OccurenceDetails from './pages/OccurenceDetails/OccurenceDetails';

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#6da696', // green.500
          borderRadius: 5,
          colorTextBase: "#000000",
          fontSize: 14,

          // Alias Token
        },
        components: {
          Menu: {
            itemBg: "#ffffff",
            itemHoverBg:'#e6f0ed', // green.50
            itemSelectedBg: "#fff", // green.100
            itemSelectedColor: '#558f7f', // green.500
          },
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainLanding />} />
            <Route path="/map" element={<MapPage />} />

            <Route path="/staff-profile" element={<StaffProfile />} />

            <Route path="/occurence">
              <Route index element={<OccurenceList />} />
              <Route
                path=":occurenceId"
                element={<OccurenceDetails/>}/>
            </Route>
            
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
