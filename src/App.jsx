import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Orders, Dashboard, POSPage, Receipts } from "./pages";
import Header from "./components/shared/Header";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader"

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<POSPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}

export default App;
