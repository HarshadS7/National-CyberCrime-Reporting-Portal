import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout";
import DashboardPage from "@/pages/dashboard";
import NewLeadPage from "@/pages/new-lead";
import PipelinePage from "@/pages/pipeline";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="new" element={<NewLeadPage />} />
        <Route path="pipeline/:id" element={<PipelinePage />} />
        <Route path="activity" element={<DashboardPage />} />
        <Route path="settings" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

