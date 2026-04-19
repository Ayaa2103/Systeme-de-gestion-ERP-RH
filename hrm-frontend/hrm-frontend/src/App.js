import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeDetail from './pages/Employees/EmployeeDetail';
import ContractManagement from './pages/Contracts/ContractManagement';
import ManageRequests from './pages/Requests/ManageRequests';
import ManageTrainings from './pages/Training/ManageTrainings';
import KpiDashboard from './pages/KpiDashboard';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import MyRequests from './pages/Employee/MyRequests';
import CreateLeaveRequest from './pages/Employee/CreateLeaveRequest';
import CreateAttestationRequest from './pages/Employee/CreateAttestationRequest';
import CreateMissionRequest from './pages/Employee/CreateMissionRequest';
import CreatePayslipRequest from './pages/Employee/CreatePayslipRequest';
import MyTrainings from './pages/Employee/MyTrainings';
import KnowledgeSkills from './pages/Employee/KnowledgeSkills';
import Events from './pages/Employee/Events';
import MyOnboarding from './pages/Employee/MyOnboarding';
import EmployeeOnboarding from './pages/Employee/EmployeeOnboarding';
import JobOffers from './pages/Recruitment/JobOffers';
import RecruitmentDashboard from './pages/Recruitment/RecruitmentDashboard';
import JobOfferDetail from './pages/Recruitment/JobOfferDetail';
import JobOffersList from './pages/Recruitment/JobOffersList';
import CreateJobOffer from './pages/Recruitment/CreateJobOffer';
import ApplicationDetail from './pages/Recruitment/ApplicationDetail';
import ApplicationsList from './pages/Recruitment/ApplicationsList';
import ProfileRecommendations from './pages/Recruitment/ProfileRecommendations';
import OnboardingDashboard from './pages/Onboarding/OnboardingDashboard';
import OnboardingPlans from './pages/Onboarding/OnboardingPlans';
import OnboardingTasks from './pages/Onboarding/OnboardingTasks';
import EmployeeProgress from './pages/Onboarding/EmployeeProgress';
import AddEmployee from './pages/Onboarding/AddEmployee';
import EmployeesList from './pages/Onboarding/EmployeesList';
import OnboardingEmployeeDetail from './pages/Onboarding/EmployeeDetail';
import KnowledgeDashboard from './pages/Knowledge/KnowledgeDashboard';
import SkillsMatrix from './pages/Knowledge/SkillsMatrix';
import VersatilityMatrix from './pages/Knowledge/VersatilityMatrix';
import Documents from './pages/Knowledge/Documents';
import AddDocument from './pages/Knowledge/AddDocument';
import CreateEmployee from './pages/Employees/CreateEmployee';
import EditEmployee from './pages/Employees/EditEmployee';
import CreateTraining from './pages/Training/CreateTraining';
import EventsList from './pages/Events/EventsList';
import CreateEvent from './pages/Events/CreateEvent';
import EventDetail from './pages/Events/EventDetail';
import EditEvent from './pages/Events/EditEvent';
import EditContract from './pages/Contracts/EditContract';
import RenewContract from './pages/Contracts/RenewContract';
import EmployeeProfile from './pages/EmployeeProfile';
import CultureDashboard from './pages/CompanyCulture/CultureDashboard';
import RespondSuggestion from './pages/CompanyCulture/RespondSuggestion';
import ManageSuggestions from './pages/CompanyCulture/ManageSuggestions';
import CreateSuggestion from './pages/CompanyCulture/CreateSuggestion';
import ManagePages from './pages/CompanyCulture/ManagePages';
import ViewPage from './pages/CompanyCulture/ViewPage';
import ApiTest from './components/ApiTest';
import AdminSpecialDashboard from './pages/Admin/AdminSpecialDashboard';
import RecommendProfile from './pages/Employee/RecommendProfile';
import ApplyJob from './pages/Employee/ApplyJob';
import { useAuth } from './contexts/AuthContext';

const ConditionalDashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'employee') {
    return <EmployeeDashboard />;
  }
  
  return <Dashboard />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées */}
            
            {/* Gestion des employés */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <EmployeeList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des demandes */}
            <Route
              path="/manage-requests"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ManageRequests />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des formations */}
            <Route
              path="/manage-trainings"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ManageTrainings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* KPI Dashboard */}
            <Route
              path="/kpi-dashboard"
              element={
                <ProtectedRoute roles={['hr_director']}>
                  <MainLayout>
                    <KpiDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail employé */}
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <EmployeeDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des contrats */}
            <Route
              path="/contracts"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <ContractManagement />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Modifier contrat */}
            <Route
              path="/contracts/:contractId/edit"
              element={
                <ProtectedRoute roles={['hr_manager']}>
                  <MainLayout>
                    <EditContract />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Renouveler contrat */}
            <Route
              path="/contracts/:contractId/renew"
              element={
                <ProtectedRoute roles={['hr_manager']}>
                  <MainLayout>
                    <RenewContract />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Recrutement */}
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <RecruitmentDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail offre d'emploi */}
            <Route
              path="/recruitment/job-offers/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <JobOfferDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail candidature */}
            <Route
              path="/recruitment/applications/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ApplicationDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Candidatures */}
            <Route
              path="/recruitment/applications"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ApplicationsList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Recommandations de profils */}
            <Route
              path="/recruitment/recommendations"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ProfileRecommendations />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Offres d'emploi */}
            <Route
              path="/job-offers"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <JobOffersList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail offre d'emploi (admin + RH) */}
            <Route
              path="/job-offers/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <JobOfferDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Créer offre d'emploi */}
            <Route
              path="/job-offers/create"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <CreateJobOffer />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <OnboardingDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Plans d'intégration */}
            <Route
              path="/onboarding/plans"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <OnboardingPlans />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Tâches d'intégration */}
            <Route
              path="/onboarding/tasks"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <OnboardingTasks />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Suivi des employés */}
            <Route
              path="/onboarding/progress"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <EmployeeProgress />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Ajouter employé */}
            <Route
              path="/onboarding/add-employee"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <AddEmployee />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Liste employés */}
            <Route
              path="/onboarding/employees"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <EmployeesList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail employé */}
            <Route
              path="/onboarding/employee/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <OnboardingEmployeeDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Créer employé */}
            <Route
              path="/employees/create"
              element={
                <ProtectedRoute roles={['hr_manager', 'administrator']}>
                  <MainLayout>
                    <CreateEmployee />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Modifier employé */}
            <Route
              path="/employees/edit/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <EditEmployee />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Créer formation */}
            <Route
              path="/trainings/create"
              element={
                <ProtectedRoute roles={['hr_manager']}>
                  <MainLayout>
                    <CreateTraining />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Culture d'entreprise */}
            <Route
              path="/culture"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CultureDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des suggestions */}
            <Route
              path="/culture/suggestions"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ManageSuggestions />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Créer suggestion */}
            <Route
              path="/culture/suggestions/create"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateSuggestion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des pages de culture */}
            <Route
              path="/culture/pages"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <ManagePages />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Voir page de culture */}
            <Route
              path="/culture/pages/:pageType"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ViewPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Répondre à une suggestion */}
            <Route
              path="/culture/suggestions/:suggestionId/respond"
              element={
                <ProtectedRoute roles={['hr_director']}>
                  <MainLayout>
                    <RespondSuggestion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Gestion des connaissances */}
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <KnowledgeDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Matrice des compétences */}
            <Route
              path="/knowledge/skills-matrix"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <SkillsMatrix />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Matrice de polyvalence */}
            <Route
              path="/knowledge/versatility-matrix"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <VersatilityMatrix />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Documents */}
            <Route
              path="/knowledge/documents"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <Documents />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Ajouter document */}
            <Route
              path="/knowledge/documents/add"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director']}>
                  <MainLayout>
                    <AddDocument />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Événements */}
            <Route
              path="/events"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <EventsList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Créer événement */}
            <Route
              path="/events/create"
              element={
                <ProtectedRoute roles={['hr_manager']}>
                  <MainLayout>
                    <CreateEvent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Modifier événement */}
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute roles={['hr_manager']}>
                  <MainLayout>
                    <EditEvent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Détail événement */}
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute roles={['hr_manager', 'hr_director', 'administrator']}>
                  <MainLayout>
                    <EventDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Profil utilisateur */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EmployeeProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard conditionnel selon le rôle */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ConditionalDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Test API - Route temporaire */}
            <Route
              path="/api-test"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ApiTest />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <EmployeeDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/requests"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <MyRequests />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/requests/create-leave"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <CreateLeaveRequest />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/requests/create-attestation"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <CreateAttestationRequest />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/requests/create-mission"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <CreateMissionRequest />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/requests/create-payslip"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <CreatePayslipRequest />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/trainings"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <MyTrainings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/knowledge"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <KnowledgeSkills />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/events"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <Events />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/onboarding"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <EmployeeOnboarding />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/recommend/:jobId"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <RecommendProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee/apply/:jobId"
              element={
                <ProtectedRoute roles={['employee']}>
                  <MainLayout>
                    <ApplyJob />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Administration */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['administrator']}>
                  <MainLayout>
                    <AdminSpecialDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['administrator']}>
                  <MainLayout>
                    <AdminSpecialDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Route 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;