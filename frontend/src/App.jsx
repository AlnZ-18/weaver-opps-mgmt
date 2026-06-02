import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailsPage from './pages/OpportunityDetailsPage';

/**
 * Root Application Router Orchestrator
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Placements Listing Page */}
        <Route path="/" element={<OpportunitiesPage />} />

        {/* Dedicated Placements Details Page */}
        <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
