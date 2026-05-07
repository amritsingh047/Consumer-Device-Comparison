import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Compare } from './pages/Compare';
import { AIFinder } from './pages/AIFinder';
import './index.css';

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/device/:id" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/ai-finder" element={<AIFinder />} />
        </Routes>
      </main>
    </BrowserRouter>
  </Provider>
);

export default App;
