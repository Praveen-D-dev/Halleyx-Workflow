import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkflowsList from './pages/WorkflowsList';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowExecution from './pages/WorkflowExecution';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workflows" element={<WorkflowsList />} />
          <Route path="workflows/new" element={<WorkflowEditor />} />
          <Route path="workflows/:id/edit" element={<WorkflowEditor />} />
          <Route path="executions/:id" element={<WorkflowExecution />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
