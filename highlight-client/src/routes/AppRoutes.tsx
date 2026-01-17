import { Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "@/pages/auth/RegisterPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<Navigate to="/register" replace />} />
    </Routes>
  );
};

export default AppRoutes;
