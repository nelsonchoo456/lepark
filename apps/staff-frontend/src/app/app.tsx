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

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#6da696', // green.500
          borderRadius: 5,
          colorTextBase: "#000000",
          fontSize: 16,

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
            <Route path="/species" element={<SpeciesPage />} />
            <Route path="/species/create" element={<CreateSpecies />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
