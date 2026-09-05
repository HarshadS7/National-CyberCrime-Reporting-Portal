import { Routes, Route } from "react-router-dom";
import LandingPage from "@/landing/LandingPage";
import Layout from "@/components/layout";
import DashboardPage from "@/pages/dashboard";
import NewLeadPage from "@/pages/new-lead";
import PipelinePage from "@/pages/pipeline";
import ActivityPage from "@/pages/activity";
import CalendarPage from "@/pages/calendar";
import CyberCrimeHomePage from "@/pages/cybercrime-home";
import WomenChildrenComplaintPage from "@/pages/women-children-complaint";
import FinancialFraudComplaintPage from "@/pages/financial-fraud-complaint";
import OtherCrimeComplaintPage from "@/pages/other-crime-complaint";
import TrackCasePage from "@/pages/track-case";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CyberCrimeHomePage />} />
      <Route path="/track" element={<TrackCasePage />} />
      <Route path="/report/women-children" element={<WomenChildrenComplaintPage />} />
      <Route path="/report/financial-fraud" element={<FinancialFraudComplaintPage />} />
      <Route path="/report/other-crime" element={<OtherCrimeComplaintPage />} />
      
      <Route path="/nerve" element={<LandingPage />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="new" element={<NewLeadPage />} />
        <Route path="pipeline/:id" element={<PipelinePage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

