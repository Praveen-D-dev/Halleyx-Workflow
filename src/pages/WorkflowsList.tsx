import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workflowApi } from '../lib/api';
import { Plus, Edit, Network, BookOpen, Play, Trash2 } from 'lucide-react';

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowApi.list();
      setWorkflows(data);
    } catch (e) {
      console.error('Failed to load workflows', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) return;
    try {
      await workflowApi.delete(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (e) {
      alert('Failed to delete workflow');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workflows</h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/workflows/new"
            className="inline-flex items-center justify-center rounded bg-[#1976d2] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#1565c0] transition-colors uppercase tracking-wider"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Workflow Name</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Version</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Status</th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900 pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workflows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  No workflows found.
                </td>
              </tr>
            ) : workflows.map((wf) => (
              <tr key={wf.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{wf.name}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{wf.version || '1.0'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${wf.is_active ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#e0e0e0] text-[rgba(0,0,0,0.87)]'}`}>
                    {wf.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                      className="p-2 text-[#1976d2] hover:bg-[#e3f2fd] rounded-full transition-colors"
                      title="Edit Workflow"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/workflows/${wf.id}/edit`)} // routing to same editor since we combining features
                      className="p-2 text-[#0288d1] hover:bg-[#e1f5fe] rounded-full transition-colors"
                      title="Manage Steps"
                    >
                      <Network className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                      className="p-2 text-[#9c27b0] hover:bg-[#f3e5f5] rounded-full transition-colors"
                      title="Manage Rules"
                    >
                      <BookOpen className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/executions/${wf.id}`)}
                      className="p-2 text-[#2e7d32] hover:bg-[#e8f5e9] rounded-full transition-colors"
                      title="Execute Workflow"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wf.id)}
                      className="p-2 text-[#d32f2f] hover:bg-[#ffebee] rounded-full transition-colors ml-2"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
