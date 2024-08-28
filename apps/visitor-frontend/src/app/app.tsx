// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import NxWelcome from './nx-welcome';
import MainLanding from './pages/MainLanding/MainLanding';

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#6da696', // Green
          borderRadius: 5,

          // Alias Token
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLanding/>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
