import { useState, useEffect } from 'react';
import { executionApi } from '../lib/api';
import { Trash2 } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await executionApi.list();
        // Adjust dependent on what challenge 1 backend returns
        // The backend `list` method might return an array or { rows, count }
        setLogs(Array.isArray(data) ? data : (data.rows || []));
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this execution log?')) return;
    try {
      await executionApi.delete(id);
      setLogs(logs.filter(log => log.id !== id));
    } catch (err) {
      alert('Failed to delete log');
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-[#e0e0e0] text-[rgba(0,0,0,0.87)]';
    const s = status.toUpperCase();
    if (s === 'COMPLETED') return 'bg-[#e8f5e9] text-[#2e7d32]';
    if (s === 'FAILED' || s === 'ERROR') return 'bg-[#ffebee] text-[#c62828]';
    if (s === 'RUNNING' || s === 'RETRYING' || s === 'IN_PROGRESS') return 'bg-[#e3f2fd] text-[#1565c0]';
    if (s === 'WAITING_APPROVAL') return 'bg-[#fff3e0] text-[#ef6c00]';
    return 'bg-[#e0e0e0] text-[rgba(0,0,0,0.87)]';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Execution Logs</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Execution ID</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Workflow Name</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Status</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Triggered By</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Error Message</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Approver ID</th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-gray-900">Date</th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                  No execution logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-bold font-mono text-gray-800">
                      {log.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{log.workflow?.name || log.Workflow?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${getStatusColor(log.status)}`}>
                      {log.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{log.triggered_by || 'System'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs block max-w-[180px] truncate ${log.error_message ? 'text-[#c62828]' : 'text-gray-500'}`} title={log.error_message}>
                      {log.error_message || '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600">
                      {log.approver_id ? log.approver_id.substring(0, 8) + '...' : '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(log.created_at || log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 text-[#d32f2f] hover:bg-[#ffebee] rounded-full transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
