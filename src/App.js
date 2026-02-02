import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_036bd9a6-b3d6-46ab-b00a-8b1b51feffdf/artifacts/yjgg4wbo_Captura%20de%20tela%202026-01-26%20215013.png";

const columnDefs = [
    { id: 'checkbox', label: '', type: 'checkbox', width: '50px' },
    { id: 'action', label: 'Ação', type: 'action', width: '60px' },
    { id: 'devopsId', label: 'ID DevOps', type: 'text', editable: false },
    { id: 'type', label: 'Work Item Type', type: 'select', options: ['Epic', 'Feature', 'User Story'], editable: true },
    { id: 'title1', label: 'Title 1 (Epic)', type: 'text', editable: true },
    { id: 'title2', label: 'Title 2 (Feature)', type: 'text', editable: true },
    { id: 'title3', label: 'Title 3 (User Story)', type: 'text', editable: true },
    { id: 'description', label: 'Description', type: 'textarea', editable: true },
    { id: 'startDate', label: 'Start Date', type: 'date', editable: true },
    { id: 'targetDate', label: 'Target Date', type: 'date', editable: true },
    { id: 'state', label: 'State', type: 'text', editable: true },
    { id: 'dependency', label: 'Dependency', type: 'text', editable: true },
    { id: 'priority', label: 'Priority', type: 'number', editable: true },
    { id: 'areaPath', label: 'Area Path', type: 'text', editable: true },
    { id: 'epicType', label: 'Epic Type', type: 'text', editable: true },
    { id: 'recorrencia', label: 'Recorrencia', type: 'text', editable: true },
    { id: 'setor', label: 'Setor', type: 'text', editable: true },
    { id: 'solicitante', label: 'Solicitante', type: 'text', editable: true },
    { id: 'effort', label: 'Effort', type: 'number', editable: true },
    { id: 'expertise', label: 'Expertise', type: 'text', editable: true },
    { id: 'complexity', label: 'Complexity', type: 'text', editable: true },
    { id: 'consultant', label: 'Consultant', type: 'text', editable: true },
    { id: 'bug', label: 'Bug?', type: 'text', editable: true },
    { id: 'obs', label: 'Obs', type: 'textarea', editable: true }
];

const initialFormData = {
    type: '',
    title: '',
    description: '',
    startDate: '',
    targetDate: '',
    areaPath: 'ascconecta\\Simonetti',
    priority: '2',
    dependency: '',
    epicType: 'Projeto',
    recorrencia: 'Não',
    setor: '',
    solicitante: '',
    effort: '',
    complexity: '3 - Baixa',
    consultant: '',
    bug: 'Não',
    expertise: '',
    obs: '',
};

const App = () => {
    const [db, setDb] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [editingCell, setEditingCell] = useState(null); // { rowIndex, colIndex }
    const [draggedCellData, setDraggedCellData] = useState(null);
    const [theme, setTheme] = useState('light');
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState(initialFormData);
    const fileInputRef = useRef(null);

    // Carregar dados e tema do localStorage na montagem
    useEffect(() => {
        const savedDb = localStorage.getItem('devops_buffer');
        if (savedDb) {
            try {
                setDb(JSON.parse(savedDb));
            } catch (e) {
                console.error('Erro ao carregar dados do localStorage:', e);
                setDb([]);
            }
        }
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Salvar DB e tema no localStorage quando eles mudarem
    useEffect(() => {
        localStorage.setItem('devops_buffer', JSON.stringify(db));
    }, [db]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.className = `${theme}-mode`;
    }, [theme]);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const processData = (e) => {
        e.preventDefault();
        if (!formData.type || !formData.title) {
            showToast('Tipo e Título são obrigatórios.', 'error');
            return;
        }

        const newItem = {
            id: generateId(),
            devopsId: '',
            type: formData.type,
            title1: formData.type === 'Epic' ? formData.title : '',
            title2: formData.type === 'Feature' ? formData.title : '',
            title3: formData.type === 'User Story' ? formData.title : '',
            description: formData.description,
            startDate: formData.type === 'Feature' ? '' : formData.startDate,
            targetDate: formData.type === 'Feature' ? '' : formData.targetDate,
            state: 'New',
            dependency: formData.dependency,
            priority: formData.priority,
            areaPath: formData.areaPath,
            epicType: formData.type === 'Epic' ? formData.epicType : '',
            recorrencia: formData.type === 'Epic' ? formData.recorrencia : '',
            setor: formData.type === 'Epic' ? formData.setor : '',
            solicitante: formData.type === 'Epic' ? formData.solicitante : '',
            effort: formData.type === 'User Story' ? formData.effort : '',
            expertise: formData.type === 'User Story' ? formData.expertise : '',
            complexity: formData.type === 'User Story' ? formData.complexity : '',
            consultant: formData.type === 'User Story' ? formData.consultant : '',
            bug: formData.type === 'User Story' ? formData.bug : '',
            obs: formData.type === 'User Story' ? formData.obs : ''
        };

        setDb(prevDb => [...prevDb, newItem]);
        showToast('Item adicionado com sucesso!', 'success');
        setFormData(initialFormData); // Reset form
    };
    
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    
    const renderDependencyOptions = () => {
        let options = [<option key="" value="">Sem dependência</option>];
        let label = "Dependência";

        if (formData.type === 'User Story') {
            label = "Dependência (Features)";
            db.filter(i => i.type === 'Feature' && i.title2)
              .forEach(f => options.push(<option key={f.id} value={f.title2}>{f.title2}</option>));
            return <><label>{label}</label><select id="dependency" value={formData.dependency} onChange={handleInputChange}>{options}</select></>;
        } else if (formData.type === 'Feature') {
            label = "Dependência (Epics)";
            db.filter(i => i.type === 'Epic' && i.title1)
              .forEach(e => options.push(<option key={e.id} value={e.title1}>{e.title1}</option>));
            return <><label>{label}</label><select id="dependency" value={formData.dependency} onChange={handleInputChange}>{options}</select></>;
        } else {
            return <><label>{label}</label><input type="text" id="dependency" value={formData.dependency} onChange={handleInputChange} placeholder="ID ou Título do Pai"/></>;
        }
    };

    // --- Funções da Tabela ---

    const handleCellUpdate = (rowIndex, columnId, value) => {
        setDb(prevDb => {
            const newDb = [...prevDb];
            newDb[rowIndex] = { ...newDb[rowIndex], [columnId]: value };
            return newDb;
        });
    };
    
    const finishCellEdit = (rowIndex, colIndex, value) => {
        handleCellUpdate(rowIndex, columnDefs[colIndex].id, value);
        setEditingCell(null);
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(db.map((_, index) => index)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const toggleRowSelection = (index) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(index)) {
            newSelectedRows.delete(index);
        } else {
            newSelectedRows.add(index);
        }
        setSelectedRows(newSelectedRows);
    };

    const deleteSelected = () => {
        const count = selectedRows.size;
        if (count === 0) return;
        
        if (window.confirm(`Tem certeza que deseja excluir ${count} item(ns) selecionado(s)?`)) {
            setDb(db.filter((_, index) => !selectedRows.has(index)));
            setSelectedRows(new Set());
            showToast(`${count} item(ns) excluído(s).`, 'success');
        }
    };
    
    const deleteRow = (index) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            setDb(db.filter((_, i) => i !== index));
            const newSelectedRows = new Set(selectedRows);
            newSelectedRows.delete(index);
            setSelectedRows(newSelectedRows);
            showToast('Item excluído.', 'success');
        }
    }

    const exportToCSV = () => {
        if (db.length === 0) {
            showToast('Buffer vazio! Adicione itens antes de exportar.', 'warning');
            return;
        }
        
        const projectName = (db.find(i => i.type === "Epic")?.title1) || "Projeto";
        const headers = columnDefs
            .filter(c => c.id !== 'checkbox' && c.id !== 'action')
            .map(c => `"${c.label}"`)
            .join(',');
        
        const rows = db.map(item =>
            columnDefs
                .filter(c => c.id !== 'checkbox' && c.id !== 'action')
                .map(col => `"${(item[col.id] || '').toString().replace(/"/g, '""')}"`)
                .join(',')
        ).join('\n');
        
        const csv = "\uFEFF" + headers + '\n' + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `DevOps_${projectName.replace(/[^a-zA-Z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        showToast('Arquivo exportado com sucesso!', 'success');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setImportData(e.target.result);
        reader.readAsText(file);
    };

    const handleImport = () => {
        if (!importData) {
            showToast('Por favor, cole os dados ou selecione um arquivo.', 'warning');
            return;
        }

        try {
            const cleanData = importData.replace(/^\uFEFF/, '');
            const lines = cleanData.split('\n').filter(line => line.trim());
            if (lines.length < 2) throw new Error('CSV precisa de cabeçalho e dados.');

            const delimiter = lines[0].includes(';') ? ';' : ',';
            const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
            const columnMap = Object.fromEntries(headers.map((h, i) => [h, i]));
            
            const getValue = (values, name) => (values[columnMap[name]] || '').trim().replace(/^"|"$/g, '');

            const newItems = lines.slice(1).map(line => {
                const values = line.split(delimiter);
                if (values.length === 0 || values.every(v => !v.trim())) return null;

                const item = {
                    id: generateId(),
                    devopsId: getValue(values, 'ID DevOps'),
                    type: getValue(values, 'Work Item Type'),
                    title1: getValue(values, 'Title 1 (Epic)'),
                    title2: getValue(values, 'Title 2 (Feature)'),
                    title3: getValue(values, 'Title 3 (User Story)'),
                    state: getValue(values, 'State') || 'New',
                    areaPath: getValue(values, 'Area Path') || '',
                    effort: getValue(values, 'Effort') || '',
                    expertise: getValue(values, 'Expertise') || '',
                    // Preencher outros campos com valores padrão
                    description: '', startDate: '', targetDate: '', dependency: '', priority: '2',
                    epicType: '', recorrencia: '', setor: '', solicitante: '', complexity: '', consultant: '', bug: 'Não', obs: ''
                };
                return (item.type && (item.title1 || item.title2 || item.title3)) ? item : null;
            }).filter(Boolean);

            if (newItems.length === 0) throw new Error('Nenhum item válido encontrado.');
            
            setDb(prev => [...prev, ...newItems]);
            showToast(`${newItems.length} itens importados com sucesso!`, 'success');
            setImportModalOpen(false);
            setImportData('');
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            showToast(`Erro ao importar: ${error.message}`, 'error');
            console.error('Erro detalhado:', error);
        }
    };


    return (
        <div className={`container ${theme}-mode`}>
            {toast.show && <div className={`toast show toast-${toast.type}`}>{toast.message}</div>}
            
            <div className="header">
                <div className="header-content">
                    <div className="logo"><img src={LOGO_URL} alt="ASC Logo" /></div>
                    <div className="app-title">DEVOPS MANAGER PRO V5.0</div>
                </div>
                <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="card">
                <h2>Planejamento de Backlog</h2>
                <form onSubmit={processData}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Work Item Type</label>
                            <select id="type" value={formData.type} onChange={handleInputChange} required>
                                <option value="" disabled>Selecione...</option>
                                <option value="Epic">Epic</option>
                                <option value="Feature">Feature</option>
                                <option value="User Story">User Story</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="required">Título</label>
                            <input type="text" id="title" value={formData.title} onChange={handleInputChange} required placeholder="Título do item" />
                        </div>
                    </div>
                     <div className="form-group">
                        <label>Descrição</label>
                        <textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Detalhes técnicos..." rows="3"></textarea>
                    </div>

                    <div className="form-grid">
                        {formData.type !== 'Feature' && <>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" id="startDate" value={formData.startDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Target Date</label>
                                <input type="date" id="targetDate" value={formData.targetDate} onChange={handleInputChange} />
                            </div>
                        </>}
                        <div className="form-group">
                            <label className="required">Area Path</label>
                            <select id="areaPath" value={formData.areaPath} onChange={handleInputChange} required>
                                <option value="ascconecta\Simonetti">ascconecta\Simonetti</option>
                                <option value="ascconecta\Viminas">ascconecta\Viminas</option>
                                <option value="ascconecta\Natcofarma">ascconecta\Natcofarma</option>
                                <option value="ascconecta\Carbom">ascconecta\Carbom</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Prioridade</label>
                            <select id="priority" value={formData.priority} onChange={handleInputChange}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <div className="form-group">{renderDependencyOptions()}</div>
                    </div>

                    {formData.type === 'Epic' && (
                        <div id="epicOnly">
                           <div className="section-divider">Configurações de Épico</div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tipo (Epic)</label>
                                    <select id="epicType" value={formData.epicType} onChange={handleInputChange}>
                                        <option value="Projeto">Projeto</option>
                                        <option value="Tarefa">Tarefa</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Recorrência</label>
                                    <select id="recorrencia" value={formData.recorrencia} onChange={handleInputChange}>
                                        <option value="Não">Não</option>
                                        <option value="Sim">Sim</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Setor</label>
                                    <input type="text" id="setor" value={formData.setor} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Solicitante</label>
                                    <input type="text" id="solicitante" value={formData.solicitante} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {formData.type === 'User Story' && (
                         <div id="storyOnly">
                            <div className="section-divider">Configurações de User Story</div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Esforço</label>
                                    <input type="number" id="effort" value={formData.effort} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Complexidade</label>
                                    <select id="complexity" value={formData.complexity} onChange={handleInputChange}>
                                        <option value="1 - Alta">1 - Alta</option>
                                        <option value="2 - Média">2 - Média</option>
                                        <option value="3 - Baixa">3 - Baixa</option>
                                    </select>
                                </div>
                                 <div className="form-group">
                                    <label>Consultor</label>
                                    <input type="text" id="consultant" value={formData.consultant} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Bug?</label>
                                    <select id="bug" value={formData.bug} onChange={handleInputChange}>
                                        <option value="Não">Não</option>
                                        <option value="Sim">Sim</option>
                                    </select>
                                </div>
                            </div>
                             <div className="form-group">
                                <label>Expertise</label>
                                <select id="expertise" value={formData.expertise} onChange={handleInputChange}>
                                     <option value="">Selecione...</option>
                                     <option value="Análise de Dados">Análise de Dados</option>
                                     <option value="Arquitetura">Arquitetura</option>
                                     {/* ... (adicione todas as outras opções) ... */}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Observação</label>
                                <textarea id="obs" value={formData.obs} onChange={handleInputChange} rows="2"></textarea>
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary"><span>➕ Processar Item</span></button>
                        <button type="button" className="btn btn-primary" onClick={() => setImportModalOpen(true)}><span>📥 Importar DevOps</span></button>
                        <button type="button" className="btn btn-primary" onClick={exportToCSV}><span>📤 Exportar (.csv)</span></button>
                    </div>
                </form>
            </div>

            <div className="card">
                 <div className="preview-header">
                    <h2 className="preview-title">Tabela Virtual - {db.length} itens</h2>
                    {selectedRows.size > 0 && (
                        <div className="bulk-actions active">
                            <span className="bulk-count">{selectedRows.size}</span>
                            <span>selecionados</span>
                            <button className="btn btn-danger" onClick={deleteSelected}><span>🗑️ Excluir</span></button>
                            <button className="btn btn-secondary" onClick={() => setSelectedRows(new Set())}><span>✕ Limpar</span></button>
                        </div>
                    )}
                </div>
                <div className="preview-container">
                    {db.length === 0 ? (
                        <div className="empty-state">Nenhum dado processado.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {columnDefs.map(col => <th key={col.id} style={{width: col.width}}>{col.id === 'checkbox' ? <input type="checkbox" onChange={toggleSelectAll} checked={selectedRows.size === db.length && db.length > 0} indeterminate={selectedRows.size > 0 && selectedRows.size < db.length}/> : col.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {db.map((item, rowIndex) => (
                                    <tr key={item.id} className={selectedRows.has(rowIndex) ? 'selected' : ''}>
                                        {columnDefs.map((col, colIndex) => (
                                            <td key={col.id} onDoubleClick={() => col.editable && setEditingCell({ rowIndex, colIndex })}>
                                                {editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={item[col.id]}
                                                        onBlur={(e) => finishCellEdit(rowIndex, colIndex, e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && finishCellEdit(rowIndex, colIndex, e.target.value)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <>
                                                        {col.id === 'checkbox' && <input type="checkbox" checked={selectedRows.has(rowIndex)} onChange={() => toggleRowSelection(rowIndex)}/>}
                                                        {col.id === 'action' && <button className="btn-delete-row" onClick={() => deleteRow(rowIndex)}>🗑️</button>}
                                                        {col.id !== 'checkbox' && col.id !== 'action' && item[col.id]}
                                                    </>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isImportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Importar Dados do DevOps</h3>
                            <button className="close-modal" onClick={() => setImportModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                             <div className="form-group">
                                <label>Cole os dados CSV do DevOps:</label>
                                <textarea value={importData} onChange={(e) => setImportData(e.target.value)} rows="10" placeholder="Cole aqui..."></textarea>
                            </div>
                            <div className="form-group">
                                <label>Ou selecione um arquivo CSV:</label>
                                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileSelect} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setImportModalOpen(false)}><span>Cancelar</span></button>
                            <button className="btn btn-primary" onClick={handleImport}><span>✓ Importar Dados</span></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
