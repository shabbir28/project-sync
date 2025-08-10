import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import { useAuth } from './Services/authContext'
import { TOAST_AUTO_CLOSE, TOAST_POSITION } from './config';

// Pages
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import Profile from './Pages/Profile'
import ManagerDashboard from './Pages/ManagerDashboard'
import DeveloperDashboard from './Pages/DeveloperDashboard'
import NotFound from './Pages/NotFound'
import TeamsList from './Pages/Manager/TeamsList'
import CreateTeam from './Pages/Manager/CreateTeam'
import TeamDetails from './Pages/Manager/TeamDetails'
import Invitations from './Pages/Developer/Invitations'
import MyTeams from './Pages/Developer/MyTeams'
import ManagerProjects from './Pages/Manager/Projects'
import CreateProject from './Pages/Manager/CreateProject'
import ProjectDetails from './Pages/Manager/ProjectDetails'
import EditProject from './Pages/Manager/EditProject'
import DeveloperProjects from './Pages/Developer/Projects'
import DeveloperProjectDetails from './Pages/Developer/ProjectDetails'
import EmployeesList from './Pages/Manager/EmployeesList'
import ResetPassword from './Pages/ResetPassword';

// Task Pages
import TaskDetail from './Pages/TaskDetail'
import ManagerTasksList from './Pages/Manager/TasksList'
import CreateTask from './Pages/Manager/CreateTask'
import EditTask from './Pages/Manager/EditTask'
import DeveloperTasksList from './Pages/Developer/TasksList'

// Client Pages
import ClientsList from './Pages/Manager/ClientsList'
import CreateClient from './Pages/Manager/CreateClient'
import ClientDetail from './Pages/Manager/ClientDetail'
import EditClient from './Pages/Manager/EditClient'

// Bug Pages
import BugsList from './Pages/Manager/BugsList'
import CreateBug from './Pages/Manager/CreateBug'
import EditBug from './Pages/Manager/EditBug'
import ManagerBugDetails from './Pages/Manager/BugDetails'
import MyBugs from './Pages/Developer/MyBugs'

// Components and Services
import { AuthProvider } from './Services/authContext'
import { ThemeProvider } from './Services/themeContext'
import RoleBasedRoute from './Components/RoleBasedRoute'
import DashboardLayout from './Layouts/DashboardLayout'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastContainer 
            position={TOAST_POSITION}
            autoClose={TOAST_AUTO_CLOSE} 
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            limit={1}
            enableMultiContainer={false}
          />
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeWithRedirect />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<AuthRedirect />} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={
            <RoleBasedRoute allowedRoles={['manager']}>
              <DashboardLayout />
            </RoleBasedRoute>
          }>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Team Routes */}
            <Route path="teams" element={<TeamsList />} />
            <Route path="teams/create" element={<CreateTeam />} />
            <Route path="teams/:id" element={<TeamDetails />} />
            
            {/* Employee Routes */}
            <Route path="employees" element={<EmployeesList />} />
            
            {/* Project Routes */}
            <Route path="projects" element={<ManagerProjects />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            
            {/* Task Routes for Manager */}
            <Route path="tasks" element={<ManagerTasksList />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="tasks/edit/:taskId" element={<EditTask />} />
            <Route path="tasks/:taskId" element={<TaskDetail />} />
            
            {/* Client Routes */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/create" element={<CreateClient />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="clients/edit/:clientId" element={<EditClient />} />
            
            {/* Bug Routes for Manager */}
            <Route path="bugs" element={<BugsList />} />
            <Route path="bugs/create" element={<CreateBug />} />
            <Route path="bugs/edit/:bugId" element={<EditBug />} />
            <Route path="bugs/:bugId" element={<ManagerBugDetails />} />
            
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          
          {/* Developer Routes */}
          <Route path="/developer" element={
            <RoleBasedRoute allowedRoles={['developer']}>
              <DashboardLayout />
            </RoleBasedRoute>
          }>
            <Route path="dashboard" element={<DeveloperDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="my-teams" element={<MyTeams />} />
            <Route path="projects" element={<DeveloperProjects />} />
            <Route path="projects/:id" element={<DeveloperProjectDetails />} />
            
            {/* Task Routes for Developer */}
            <Route path="tasks" element={<DeveloperTasksList />} />
            <Route path="tasks/:taskId" element={<TaskDetail />} />
            
            {/* Bug Routes for Developer */}
            <Route path="bugs" element={<MyBugs />} />
            <Route path="bugs/:bugId" element={<Navigate to="/developer/bugs" replace />} />
            
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Profile redirect */}
          <Route path="/profile" element={<Navigate to="/login" replace />} />

          {/* 404 Not Found - This should be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

function AuthRedirect() {
  const { isLoggedIn, userRole } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (userRole === 'developer') {
    return <Navigate to="/developer/dashboard" replace />;
  } else {
    // Unknown role, redirect to login as a fallback
    return <Navigate to="/login" replace />;
  }
}

function HomeWithRedirect() {
  const { isLoggedIn, userRole } = useAuth();
  
  if (isLoggedIn) {
    if (userRole === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (userRole === 'developer') {
      return <Navigate to="/developer/dashboard" replace />;
    }
  }
  
  return <Home />;
}
