import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { workflowApi } from '../lib/api';
import { Save, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

const CustomStepNode = ({ data, id }: any) => {
  return (
    <div className="bg-white border-2 border-indigo-500 rounded-xl shadow-lg w-64 overflow-hidden">
      <div className="bg-indigo-500 p-2 text-white">
        <input 
          type="text" 
          value={data.label} 
          onChange={(e) => data.onChange(id, 'label', e.target.value)}
          className="font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-indigo-200 px-1"
          placeholder="Step Name"
        />
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
      
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step Type</label>
          <select 
            value={data.stepType || 'task'} 
            onChange={(e) => data.onChange(id, 'stepType', e.target.value)}
            className="text-sm bg-gray-50 border border-gray-300 rounded block w-full p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
            <option value="task">Task</option>
            <option value="approval">Approval</option>
            <option value="notification">Notification</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rules</label>
          {(data.rules || []).map((rule: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-1 mb-3 bg-gray-50 p-2 rounded border border-gray-200 relative">
              <button 
                onClick={() => data.removeRule(id, idx)} 
                className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                title="Remove Rule"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <input 
                type="text" 
                value={rule.condition}
                onChange={(e) => data.onRuleChange(id, idx, 'condition', e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 w-[90%]"
                placeholder="Condition (e.g. amount > 100)"
              />
            </div>
          ))}
          <button 
            onClick={() => data.addRule(id)}
            className="text-xs text-indigo-600 font-medium hover:text-indigo-800 self-start mt-1 flex items-center gap-1"
          >
            <PlusCircle className="w-3 h-3" />
            Add Rule
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
    </div>
  );
};

const nodeTypes = {
  customStep: CustomStepNode
};

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  
  // Structured input schema state
  const [schemaFields, setSchemaFields] = useState<any[]>([
    { name: 'amount', type: 'number', required: true }
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);

  // Node data update handlers
  const onNodeDataChange = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, [key]: value } };
      }
      return n;
    }));
  }, [setNodes]);

  const onRuleChange = useCallback((nodeId: string, ruleIdx: number, key: string, value: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        const newRules = Array.isArray(n.data.rules) ? [...n.data.rules] : [];
        newRules[ruleIdx] = { ...newRules[ruleIdx], [key]: value };
        return { ...n, data: { ...n.data, rules: newRules } };
      }
      return n;
    }));
  }, [setNodes]);

  const addRule = useCallback((nodeId: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        const newRules = Array.isArray(n.data.rules) ? [...n.data.rules, { condition: '' }] : [{ condition: '' }];
        return { ...n, data: { ...n.data, rules: newRules } };
      }
      return n;
    }));
  }, [setNodes]);

  const removeRule = useCallback((nodeId: string, ruleIdx: number) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        const newRules = Array.isArray(n.data.rules) ? [...n.data.rules] : [];
        newRules.splice(ruleIdx, 1);
        return { ...n, data: { ...n.data, rules: newRules } };
      }
      return n;
    }));
  }, [setNodes]);


  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const data = await workflowApi.get(workflowId);
      setWorkflowName(data.name);
      
      let parsedSchema: any = {};
      if (data.input_schema && typeof data.input_schema === 'string') {
          try { parsedSchema = JSON.parse(data.input_schema); } catch(e) {}
      } else if (data.input_schema) {
          parsedSchema = data.input_schema;
      }
      
      const fields = Object.entries(parsedSchema).map(([key, val]: any) => ({
        name: key,
        type: val.type || 'string',
        required: !!val.required
      }));
      setSchemaFields(fields.length ? fields : []);

      const loadedNodes: any[] = [];
      const loadedEdges: any[] = [];

      data.steps?.forEach((step: any, idx: number) => {
        const mappedRules = (step.rules || []).map((r: any) => ({ condition: r.condition, id: r.id }));

        loadedNodes.push({
          id: step.id.toString(),
          position: { x: 250, y: idx * 300 + 50 },
          type: 'customStep',
          data: { 
            label: step.name,
            stepType: step.step_type || 'task',
            rules: mappedRules,
            onChange: onNodeDataChange,
            onRuleChange: onRuleChange,
            addRule: addRule,
            removeRule: removeRule
          }
        });

        step.rules?.forEach((rule: any) => {
          if (rule.next_step_id) {
            loadedEdges.push({
              id: `e-${step.id}-${rule.next_step_id}-${rule.id}`,
              source: step.id.toString(),
              target: rule.next_step_id.toString(),
              label: rule.is_default ? 'DEFAULT' : rule.condition,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
            });
          }
        });
      });

      setNodes(loadedNodes);
      setEdges(loadedEdges);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)), [setEdges]);

  const handleSave = async () => {
    try {
      // Build schemaObj from UI
      const schemaObj: any = {};
      for (const field of schemaFields) {
        if (field.name.trim()) {
          schemaObj[field.name.trim()] = {
            type: field.type,
            required: field.required
          };
        }
      }

      const payload = {
        name: workflowName,
        input_schema: schemaObj,
      };

      if (id) {
        await workflowApi.update(id, payload);
        navigate('/workflows');
      } else {
        const res = await workflowApi.create(payload);
        navigate(`/workflows/${res.id}/edit`);
      }
    } catch (e: any) {
      alert("Save failed: " + e.message);
    }
  };

  const addStep = () => {
    const newNodeId = `temp-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      type: 'customStep',
      data: { 
        label: 'New Step',
        stepType: 'task',
        rules: [],
        onChange: onNodeDataChange,
        onRuleChange: onRuleChange,
        addRule: addRule,
        removeRule: removeRule
      }
    } as any;
    setNodes((nds) => nds.concat(newNode));
  };

  const addSchemaField = () => {
    setSchemaFields([...schemaFields, { name: '', type: 'string', required: false }]);
  };

  const updateSchemaField = (idx: number, key: string, val: any) => {
    const newFields = [...schemaFields];
    newFields[idx] = { ...newFields[idx], [key]: val };
    setSchemaFields(newFields);
  };

  const removeSchemaField = (idx: number) => {
    const newFields = [...schemaFields];
    newFields.splice(idx, 1);
    setSchemaFields(newFields);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/workflows')} className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={workflowName} 
            onChange={e => setWorkflowName(e.target.value)} 
            className="text-xl font-bold text-gray-900 border-none outline-none bg-transparent focus:ring-0 placeholder-gray-400"
            placeholder="Workflow Name"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={addStep} className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <PlusCircle className="w-4 h-4 mr-2 text-gray-500" />
            Add Step
          </button>
          <button onClick={handleSave} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save & Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Schema */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Input Schema Builder</h3>
            <p className="text-xs text-gray-500 mt-1">Define the structured data required to start this workflow.</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
            {schemaFields.map((field, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm relative">
                <button onClick={() => removeSchemaField(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="mb-2 pr-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                  <input 
                    type="text" 
                    value={field.name}
                    onChange={(e) => updateSchemaField(idx, 'name', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded px-2 py-1 border focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. user_email"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                     <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                     <select 
                       value={field.type}
                       onChange={(e) => updateSchemaField(idx, 'type', e.target.value)}
                       className="w-full text-sm border-gray-300 rounded px-2 py-1 border bg-white focus:ring-indigo-500 focus:border-indigo-500"
                     >
                       <option value="string">String</option>
                       <option value="number">Number</option>
                       <option value="boolean">Boolean</option>
                     </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer mb-1">
                      <input 
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateSchemaField(idx, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Required
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addSchemaField}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 font-medium hover:text-gray-700 hover:border-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Field
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={nodeTypes}
            className="bg-gray-50"
          >
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

