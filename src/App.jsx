import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Company from './pages/Company';

import Admin from './pages/Admin/Admin';
// import CompaniesList from './pages/Admin/CompaniesList';
// import Users from './pages/Admin/Users';
// import EditCompanies from './pages/Admin/EditCompanies';
import UsersList from './pages/Admin/Users';
import EditCompanies from './pages/Admin/EditCompanies';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/companies" element={<Company />} />
        <Route path="/admin" element={<Admin />} />
        {/* <Route path="/admin/companies" element={<CompaniesList />} /> */}
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/edit-company" element={<EditCompanies />} />
      </Routes>
    </Router>
  );
}

export default App;
