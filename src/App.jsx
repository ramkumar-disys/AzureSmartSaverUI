import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Page from './Page';
import Response from './Response';
import Header from './Header';

function App() {
  return (
    <div>
        <Header />
        <BrowserRouter>
          <Routes>
          <Route path='/' element={<Page />} />
          <Route path='/response' element={<Response />} />
          </Routes>
        
        </BrowserRouter>

    </div>
  );
}

export default App;
