// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLanding from './pages/MainLanding';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLanding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
