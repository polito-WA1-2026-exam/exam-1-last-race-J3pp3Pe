import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from './contexts/UserContext.jsx';
import { GameProvider } from './contexts/GameContext.jsx';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import InstructionsPage from './pages/InstructionsPage';
import SetupPage from './pages/SetupPage';
import PlanPage from './pages/PlanPage';
import ExecutePage from './pages/ExecutePage';
import ResultPage from './pages/ResultPage';
import RankingsPage from './pages/RankingsPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <UserProvider>
        <GameProvider>
          <Header />
          <main className="container mt-4 pb-4">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/instructions" element={<InstructionsPage />} />
              <Route path="/setup" element={<PrivateRoute><SetupPage /></PrivateRoute>} />
              <Route path="/plan" element={<PrivateRoute><PlanPage /></PrivateRoute>} />
              <Route path="/execute" element={<PrivateRoute><ExecutePage /></PrivateRoute>} />
              <Route path="/result" element={<PrivateRoute><ResultPage /></PrivateRoute>} />
              <Route path="/rankings" element={<PrivateRoute><RankingsPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </GameProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
