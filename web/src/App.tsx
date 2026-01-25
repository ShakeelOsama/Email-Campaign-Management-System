import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  Dashboard,
  CampaignList,
  CreateCampaign,
  CampaignDetail,
  EditCampaign,
  Analytics,
  Settings,
} from './pages';
import './index.css';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/campaigns/:id/edit" element={<EditCampaign />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
