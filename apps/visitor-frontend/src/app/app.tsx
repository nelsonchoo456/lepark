// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { ConfigProvider } from 'antd';

import NxWelcome from './nx-welcome';

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#6da696',
          borderRadius: 5,

          // Alias Token
        },
      }}
    >
      <div>
        <NxWelcome title="visitor-frontend" />
      </div>
    </ConfigProvider>
  );
}

export default App;
