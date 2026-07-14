import React, { useState, useEffect, useRef } from 'react';
import { 
  searchEntities, 
  checkRelationship, 
  createRelationship, 
  fetchRelationshipTypes, 
  fetchCommonWords,
  type RelationshipEntity 
} from '../../services/relationshipAdminService';

const AdminRelationships: React.FC = () => {
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [sourceResults, setSourceResults] = useState<RelationshipEntity[]>([]);
  const [targetResults, setTargetResults] = useState<RelationshipEntity[]>([]);
  
  const [source, setSource] = useState<RelationshipEntity | null>(null);
  const [target, setTarget] = useState<RelationshipEntity | null>(null);
  
  const [relationship, setRelationship] = useState('');
  const [type, setType] = useState('');
  const [context, setContext] = useState('');
  const [inverseOverride, setInverseOverride] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
  const [commonWords, setCommonWords] = useState<string[]>([]);
  
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [keepSource, setKeepSource] = useState(true);
  const [sessionLog, setSessionLog] = useState<{msg: string, time: Date}[]>([]);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  
  const targetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRelationshipTypes().then(res => setRelationshipTypes(res || []));
    fetchCommonWords().then(res => setCommonWords(res || []));
  }, []);

  useEffect(() => {
    if (sourceQuery.length >= 2) {
      setSourceError(null);
      const delayFn = setTimeout(() => {
        searchEntities(sourceQuery)
          .then(res => setSourceResults(res || []))
          .catch(err => {
            console.error(err);
            setSourceError("Couldn't load results");
            setSourceResults([]);
          });
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setSourceResults([]);
      setSourceError(null);
    }
  }, [sourceQuery]);

  useEffect(() => {
    if (targetQuery.length >= 2) {
      setTargetError(null);
      const delayFn = setTimeout(() => {
        searchEntities(targetQuery)
          .then(res => setTargetResults(res || []))
          .catch(err => {
            console.error(err);
            setTargetError("Couldn't load results");
            setTargetResults([]);
          });
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setTargetResults([]);
      setTargetError(null);
    }
  }, [targetQuery]);

  useEffect(() => {
    if (source && target && relationship.trim()) {
      const delayFn = setTimeout(() => {
        checkRelationship(source.id, target.id, relationship.trim()).then(res => {
          if (res && res.exists) {
            setDuplicateWarning(
              `${source.name} (${source.entity_type}) —[ ${relationship} ]→ ${target.name} (${target.entity_type}) ` +
              `already exists (context: ${res.context || 'none'}). Submitting again will update it.`
            );
          } else {
            setDuplicateWarning(null);
          }
        });
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setDuplicateWarning(null);
    }
  }, [source, target, relationship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !target || !relationship.trim() || !type) return;

    try {
      const res = await createRelationship({
        source_id: source.id,
        target_id: target.id,
        relationship: relationship.trim(),
        type,
        context: context.trim() || undefined,
        inverse_relationship: inverseOverride.trim() || undefined,
        overwrite: !!duplicateWarning
      });

      const forwardDoc = res?.docs?.[0];
      const inverseDoc = res?.docs?.[1];

      const forwardMsg = `${source.name} (${source.entity_type}) —[ ${forwardDoc?.relationship || relationship.trim()} ]→ ${target.name} (${target.entity_type})`;
      const newLogs = [{ msg: forwardMsg, time: new Date() }];
      
      if (inverseDoc) {
        newLogs.push({
          msg: `${target.name} (${target.entity_type}) —[ ${inverseDoc.relationship} ]→ ${source.name} (${source.entity_type}) (auto-generated inverse)`,
          time: new Date()
        });
      }

      setSessionLog(prev => [...newLogs, ...prev]);

      if (keepSource) {
        setTarget(null);
        setTargetQuery('');
        setRelationship('');
        setContext('');
        setInverseOverride('');
        setTimeout(() => targetInputRef.current?.focus(), 100);
      } else {
        setSource(null);
        setSourceQuery('');
        setTarget(null);
        setTargetQuery('');
        setRelationship('');
        setType('');
        setContext('');
        setInverseOverride('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit relationship');
    }
  };

  const renderPicker = (
    label: string, 
    value: RelationshipEntity | null, 
    setValue: (v: RelationshipEntity | null) => void, 
    query: string, 
    setQuery: (q: string) => void, 
    results: RelationshipEntity[],
    error: string | null,
    inputRef?: React.RefObject<HTMLInputElement | null>
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      {value ? (
        <div className="flex items-center bg-[#252525] p-2 rounded justify-between">
          <div className="flex items-center gap-3">
            {value.image && <img src={value.image} alt="" className="w-8 h-8 rounded object-cover" />}
            <div className="flex items-center gap-2">
              <div className="text-white font-medium">{value.name}</div>
              <div className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                {value.entity_type}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setValue(null)} className="text-gray-400 hover:text-white px-2">✕</button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {error && (
            <div className="absolute z-50 w-full mt-1 bg-red-900/90 border border-red-500 rounded p-2 text-white text-sm">
              {error}
            </div>
          )}
          {results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[#252525] border border-[#333] rounded shadow-lg max-h-60 overflow-y-auto">
              {results.map(r => (
                <div 
                  key={r.id} 
                  className="flex items-center gap-3 p-2 hover:bg-[#333] cursor-pointer"
                  onClick={() => { setValue(r); setQuery(''); }}
                >
                  {r.image && <img src={r.image} alt="" className="w-8 h-8 rounded object-cover" />}
                  <div className="flex items-center gap-2">
                    <div className="text-white font-medium">{r.name}</div>
                    <div className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {r.entity_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Relationships</h1>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input 
            type="checkbox" 
            checked={keepSource} 
            onChange={(e) => setKeepSource(e.target.checked)}
            className="rounded border-gray-600 bg-[#252525] text-red-500 focus:ring-red-500"
          />
          Keep source & type for next entry
        </label>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333] mb-6">
        <div className="grid grid-cols-2 gap-6">
          {renderPicker("Source Entity", source, setSource, sourceQuery, setSourceQuery, sourceResults, sourceError)}
          {renderPicker("Target Entity", target, setTarget, targetQuery, setTargetQuery, targetResults, targetError, targetInputRef)}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Relationship Word</label>
            <input
              type="text"
              list="common-words"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="e.g. father, teammate, rival"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
            />
            <datalist id="common-words">
              {commonWords.map(w => <option key={w} value={w} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type (Category)</label>
            <select
              className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select a type...</option>
              {relationshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {source && target && relationship.trim() && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200 text-sm text-center font-medium tracking-wide">
            {source.name} ({source.entity_type}) —[ {relationship.trim()} ]→ {target.name} ({target.entity_type})
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">Context (Optional)</label>
          <input
            type="text"
            className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            placeholder="e.g. During the Chunin Exams"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {(!source || source.entity_type === 'character') && (!target || target.entity_type === 'character') && (
          <div className="mb-6">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-red-500 hover:text-red-400 font-medium"
            >
              {showAdvanced ? '- Hide Advanced Options' : '+ Show Advanced Options'}
            </button>
            
            {showAdvanced && (
              <div className="mt-3 p-4 bg-[#252525] rounded border border-[#333]">
                <label className="block text-sm font-medium text-gray-400 mb-1">Override Inverse Relationship</label>
                <input
                  type="text"
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. daughter (if target is female and relationship is father)"
                  value={inverseOverride}
                  onChange={(e) => setInverseOverride(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Only needed when the auto-generated inverse would be wrong (like picking "son" vs "daughter" instead of a generic fallback).
                </p>
              </div>
            )}
          </div>
        )}

        {duplicateWarning && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-500 text-sm">
            ⚠️ {duplicateWarning}
          </div>
        )}

        <button
          type="submit"
          disabled={!source || !target || !relationship.trim() || !type}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {duplicateWarning ? 'Update Relationship' : 'Add Relationship'}
        </button>
      </form>

      {sessionLog.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-white mb-3">Session Log</h2>
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] divide-y divide-[#333]">
            {sessionLog.map((log, idx) => (
              <div key={idx} className="p-3 text-sm flex justify-between items-center text-gray-300">
                <span>✅ {log.msg}</span>
                <span className="text-gray-500">{log.time.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRelationships;
