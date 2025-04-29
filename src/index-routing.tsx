import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { Home } from './components/pages/home';
import { Profile } from './components/pages/profile';
import { HomeModel } from './components/pages/home-model';
import { NotFound } from './components/pages/not-found';
import { HomeModelConfig } from './components/pages/home-model-config';

export const IndexRouting = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<HomeModelConfig />} />
          <Route path="/model/:modelId" element={<HomeModel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};
/*
   - index has the full page []
      - model as the index
*/
