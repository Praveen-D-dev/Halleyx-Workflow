import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executionApi, workflowApi } from '../lib/api';
import { Play, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function WorkflowExecution() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<any>(null);
  
  // Dynamic inputs state
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [schemaFields, setSchemaFields] = useState<any[]>([]);

  const [executing, setExecuting] = useState(false);
  const [execution, setExecution] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadInitialData = async () => {
        setLoading(true);
        setNotFound(false);
        setError(null);
        try {
          // Try fetching as an execution first
          try {
            const execData = await executionApi.get(id);
            setExecution(execData);
            if (execData.status === 'IN_PROGRESS' || execData.status === 'QUEUED') {
                setExecuting(true);
            }
            // Fetch the associated workflow
            const wfData = await workflowApi.get(execData.workflow_id);
            setupWorkflow(wfData);
          } catch (e: any) {
            // If execution fetch fails (like 404), try as a workflow ID
            try {
              const wfData = await workflowApi.get(id);
              setupWorkflow(wfData);
            } catch (wfErr: any) {
              if (wfErr.response?.status === 404 || e.response?.status === 404) {
                setNotFound(true);
              } else {
                throw wfErr;
              }
            }
          }
        } catch (e: any) {
          setError("Failed to load details: " + (e.response?.data?.error || e.message));
        } finally {
          setLoading(false);
        }
      };

      const setupWorkflow = (data: any) => {
        setWorkflow(data);
        let parsedSchema: any = {};
        if (data.input_schema && typeof data.input_schema === 'string') {
          try { parsedSchema = JSON.parse(data.input_schema); } catch (e) {}
        } else if (data.input_schema) {
          parsedSchema = data.input_schema;
        }

        const fields = Object.entries(parsedSchema).map(([key, val]: any) => ({
          name: key,
          type: val.type || 'string',
          required: !!val.required
        }));
        setSchemaFields(fields);

        // Initialize empty inputs
        const initialInputs: Record<string, any> = {};
        fields.forEach(f => { initialInputs[f.name] = ''; });
        setInputs(initialInputs);
      };

      loadInitialData();
    }
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (executing && execution?.id) {
      interval = setInterval(async () => {
        const updated = await executionApi.get(execution.id);
        setExecution(updated);
        if (updated.status === 'COMPLETED' || updated.status === 'FAILED' || updated.status === 'WAITING_APPROVAL' || updated.status === 'CANCELED') {
          setExecuting(false);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [executing, execution]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleRun = async () => {
    setExecuting(true);
    setError(null);
    setExecution(null);
    try {
      const newExec = await executionApi.start(id as string, { data: inputs, user_id: 'user123' });
      setExecution(newExec);
    } catch (e: any) {
      setError(e.message || 'Execution failed to start.');
      setExecuting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setExecuting(true);
      await executionApi.approve(execution.id, { approved_by: 'manager_1' });
    } catch (e: any) {
      alert("Failed to approve: " + e.message);
      setExecuting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'text-[#2e7d32] bg-[#e8f5e9] border-[#c8e6c9]';
      case 'FAILED': return 'text-[#c62828] bg-[#ffebee] border-[#ffcdd2]';
      case 'WAITING_APPROVAL': return 'text-[#ef6c00] bg-[#fff3e0] border-[#ffe0b2]';
      case 'IN_PROGRESS': return 'text-[#1565c0] bg-[#e3f2fd] border-[#bbdefb]';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div></div>;

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded shadow-md border border-gray-200 p-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-500 mb-8">We couldn't find the workflow or execution with ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{id}</code></p>
          <Link to="/dashboard" className="inline-flex items-center text-[#1976d2] hover:underline font-medium">
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!workflow) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Execute Workflow</h1>

      <div className="bg-white rounded shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Workflow Inputs</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {schemaFields.length === 0 ? (
            <div className="col-span-3 text-sm text-gray-500 italic">No input fields defined for this workflow.</div>
          ) : (
            schemaFields.map(field => (
              <div key={field.name} className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1 capitalize">{field.name} {field.required && <span className="text-red-500">*</span>}</label>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  name={field.name}
                  value={inputs[field.name] || ''}
                  onChange={handleChange}
                  placeholder={`e.g., ${field.type === 'number' ? '150' : 'Value'}`}
                  className="w-full text-sm border-gray-300 rounded px-3 py-2 border focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] outline-none transition-shadow"
                  required={field.required}
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleRun}
            disabled={executing}
            className={`flex items-center justify-center rounded px-6 py-2.5 text-sm font-medium text-white shadow transition-colors uppercase tracking-wider ${
              executing ? 'bg-[#90caf9] cursor-not-allowed' : 'bg-[#1976d2] hover:bg-[#1565c0]'
            }`}
          >
            <Play className="w-5 h-5 mr-2" />
            {executing && !execution?.logs?.length ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      </div>

      {executing && (
        <div className="mb-6 h-1 w-full bg-[#bbdefb] overflow-hidden rounded">
          <div className="h-full bg-[#1976d2] animate-[indeterminate_1.5s_infinite_linear] origin-left w-1/2"></div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded bg-[#ffebee] border border-[#ffcdd2] flex items-center gap-3 text-[#c62828] text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {execution?.status === 'COMPLETED' && (
        <div className="mb-6 p-4 rounded bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] text-sm font-medium">
          Workflow executed successfully!
        </div>
      )}

      {execution && execution.logs?.length > 0 && (
        <div className="bg-white rounded shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f5f5] flex justify-between items-center">
             <h3 className="font-semibold text-gray-800">Execution Logs</h3>
             <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusColor(execution.status)}`}>
               {execution.status}
             </span>
          </div>
          
          <div className="p-6">
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {execution.logs.map((log: any) => {
                  const rules = JSON.parse(log.evaluated_rules || '[]');
                  return (
                    <div key={log.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                          log.status === 'COMPLETED' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 
                          log.status === 'FAILED' ? 'bg-[#ffebee] text-[#c62828]' : 'bg-[#e3f2fd] text-[#1565c0]'
                      }`}>
                        {log.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : 
                         log.status === 'FAILED' ? <XCircle className="w-5 h-5" /> : 
                         <Clock className="w-5 h-5 animate-pulse" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">Step Execution</h4>
                          <span className="text-xs text-gray-500 font-mono">{new Date(log.started_at).toLocaleTimeString()}</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                            log.status === 'COMPLETED' ? 'text-[#2e7d32]' : 
                            log.status === 'FAILED' ? 'text-[#c62828]' : 'text-[#1565c0]'
                        }`}>{log.status}</p>
                        
                        {rules.length > 0 && (
                          <div className="bg-[#f5f5f5] rounded p-2 mb-2 border border-gray-200">
                            <h5 className="text-[10px] uppercase text-gray-500 font-bold mb-1">Evaluated Rules</h5>
                            <ul className="space-y-1">
                              {rules.map((r: any, i: number) => (
                                <li key={i} className="text-xs flex justify-between items-center bg-white p-1 rounded border border-gray-100">
                                  <code className="text-[#1976d2] truncate max-w-[150px]">{r.condition}</code>
                                  <span className={r.result ? 'text-[#2e7d32] font-bold' : 'text-gray-400'}>{r.result ? 'TRUE' : 'FALSE'}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {log.error_message && (
                          <div className="bg-[#ffebee] text-[#c62828] text-xs p-2 rounded border border-[#ffcdd2] mt-2">
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
      )}

      {execution?.status === 'WAITING_APPROVAL' && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleApprove}
            className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-medium py-2.5 px-6 rounded shadow transition-colors flex items-center gap-2 uppercase tracking-wider text-sm"
          >
            <CheckCircle className="w-5 h-5" />
            Approve Execution
          </button>
        </div>
      )}
    </div>
  );
}
