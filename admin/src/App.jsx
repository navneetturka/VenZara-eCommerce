import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminShell from "./components/AdminShell.jsx";
import Login from "./pages/Login.jsx";
import Add from "./pages/Add.jsx";
import List from "./pages/List.jsx";
import Edit from "./pages/Edit.jsx";
import Orders from "./pages/Orders.jsx";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/login" replace />;
  return <AdminShell>{children}</AdminShell>;
};

const App = () => (
  <>
    <ToastContainer position="top-right" theme="light" />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/add"
        element={
          <PrivateRoute>
            <Add />
          </PrivateRoute>
        }
      />
      <Route
        path="/list"
        element={
          <PrivateRoute>
            <List />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <PrivateRoute>
            <Edit />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/add" replace />} />
      <Route path="*" element={<Navigate to="/add" replace />} />
    </Routes>
  </>
);

export default App;
