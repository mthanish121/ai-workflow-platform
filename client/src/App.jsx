import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import ConnectionsPage from './pages/ConnectionsPage';
import McpPage from './pages/McpPage';
import { FoldersPage, FavoritesPage } from './pages/PlaceholderPages';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowDetail from './pages/WorkflowDetail';
import LogsPage from './pages/LogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#ff4f00', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            },
          }}
        />
        <Routes>
          {/* Public Landing & Pricing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Protected Application Workspace Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Layout><TemplatesPage /></Layout></ProtectedRoute>} />
          <Route path="/folders" element={<ProtectedRoute><Layout><FoldersPage /></Layout></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Layout><FavoritesPage /></Layout></ProtectedRoute>} />
          <Route path="/connections" element={<ProtectedRoute><Layout><ConnectionsPage /></Layout></ProtectedRoute>} />
          <Route path="/app/connections" element={<ProtectedRoute><Layout><ConnectionsPage /></Layout></ProtectedRoute>} />
          <Route path="/app/assets/connections" element={<ProtectedRoute><Layout><ConnectionsPage /></Layout></ProtectedRoute>} />
          
          <Route path="/mcp" element={<ProtectedRoute><Layout><McpPage /></Layout></ProtectedRoute>} />
          <Route path="/app/mcp" element={<ProtectedRoute><Layout><McpPage /></Layout></ProtectedRoute>} />
          <Route path="/mcp/servers" element={<ProtectedRoute><Layout><McpPage /></Layout></ProtectedRoute>} />

          <Route path="/workflows" element={<ProtectedRoute><Layout><WorkflowsPage /></Layout></ProtectedRoute>} />
          <Route path="/workflows/new" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/workflows/:id" element={<ProtectedRoute><Layout><WorkflowDetail /></Layout></ProtectedRoute>} />
          <Route path="/workflows/:id/edit" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/editor/:id" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/editor/:id/setup" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/editor/:id/configure" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/editor/:id/test" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Layout><LogsPage /></Layout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
