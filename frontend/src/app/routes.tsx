import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './components/Login';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { SelectModel } from './components/SelectModel';
import { UploadImage } from './components/UploadImage';
import { Results } from './components/Results';
import { AllAnalyses } from './components/AllAnalyses';
import { AnalysisDetails } from './components/AnalysisDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/doctor',
    element: <DoctorDashboard />
  },
  {
    path: '/patient',
    element: <PatientDashboard />
  },
  {
    path: '/select-model',
    element: <SelectModel />
  },
  {
    path: '/upload',
    element: <UploadImage />
  },
  {
    path: '/results',
    element: <Results />
  },
  {
    path: '/all-analyses',
    element: <AllAnalyses />
  },
  {
    path: '/analysis/:id',
    element: <AnalysisDetails />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
