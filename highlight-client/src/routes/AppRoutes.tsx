import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import RecordingsPage from "@/pages/recordings/RecordingsPage";
import ClipsCandidatesPage from "@/pages/ClipsCandidatesPage";
import ClipsLibraryPage from "@/pages/ClipsLibraryPage";
import AnalyticsPage from "@/pages/AnalyticsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/recordings" element={<RecordingsPage />} />
      <Route path="/clips-candidates" element={<ClipsCandidatesPage />} />
      <Route path="/clips-library" element={<ClipsLibraryPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
