import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EvaluationForm from './components/EvaluationForm';
import ProspectDetail from './components/ProspectDetail';
import PrintableProspect from './components/PrintableProspect';
import FontStyles from './components/ui/FontStyles';
import Toast from './components/ui/Toast';
import {
  fetchAllProspects, createProspect, updateProspect, deleteProspect,
  addMeasurementPhoto, deleteMeasurementPhoto,
} from './lib/firestore';
import { exportProspectToPDF } from './lib/pdf';
import { prospectToFormData } from './lib/helpers';
import type { Prospect, View, ToastState, MeasurementPhoto } from './types';

// =========================================================
// MAIN — App (orquestador de vistas + estado global)
// =========================================================
export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (type: 'success' | 'error', message: string, duration = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  // ----- Carga inicial
  const loadProspects = async () => {
    try {
      setLoading(true);
      const items = await fetchAllProspects();
      setProspects(items);
    } catch (err: any) {
      console.error('❌ Error cargando:', err);
      showToast('error', 'Error al cargar la lista', 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  // ----- Crear / actualizar prospecto
  const handleSaveProspect = async (formData: any) => {
    setSaving(true);
    try {
      if (editingId) {
        await updateProspect(editingId, formData);
        showToast('success', 'Evaluación actualizada');
      } else {
        await createProspect(formData);
        showToast('success', 'Evaluación guardada');
      }
      await loadProspects();
      setView('dashboard');
      setEditingId(null);
      setSelectedProspect(null);
    } catch (err: any) {
      console.error('❌ Error guardando:', err);
      showToast('error', 'Error: ' + (err.message || 'desconocido'), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ----- Borrar prospecto
  const handleDeleteProspect = async () => {
    if (!selectedProspect) return;
    try {
      await deleteProspect(selectedProspect.id);
      showToast('success', 'Prospecto eliminado');
      await loadProspects();
      setView('dashboard');
      setSelectedProspect(null);
    } catch (err: any) {
      console.error('❌ Error borrando:', err);
      showToast('error', 'Error al eliminar', 5000);
    }
  };

  // ----- Añadir foto comparativa
  const handleAddPhoto = async ({ photo, category, notes }: any) => {
    if (!selectedProspect) return;
    setAddingPhoto(true);
    try {
      const updatedPhotos = await addMeasurementPhoto(
        selectedProspect.id, photo, category, notes,
        selectedProspect.measurementPhotos || []
      );
      const updated = { ...selectedProspect, measurementPhotos: updatedPhotos };
      setSelectedProspect(updated);
      setProspects((prev) => prev.map((p) => (p.id === selectedProspect.id ? updated : p)));
      showToast('success', 'Foto añadida');
    } catch (err: any) {
      console.error('❌ Error subiendo foto:', err);
      showToast('error', 'Error al subir foto', 5000);
    } finally {
      setAddingPhoto(false);
    }
  };

  // ----- Borrar foto comparativa
  const handleDeletePhoto = async (photoToDelete: MeasurementPhoto) => {
    if (!selectedProspect) return;
    try {
      const updatedPhotos = await deleteMeasurementPhoto(
        selectedProspect.id, photoToDelete,
        selectedProspect.measurementPhotos || []
      );
      const updated = { ...selectedProspect, measurementPhotos: updatedPhotos };
      setSelectedProspect(updated);
      setProspects((prev) => prev.map((p) => (p.id === selectedProspect.id ? updated : p)));
      showToast('success', 'Foto eliminada');
    } catch (err: any) {
      console.error('❌ Error borrando foto:', err);
      showToast('error', 'Error al eliminar foto', 5000);
    }
  };

  // ----- Exportar a PDF
  const handleExportPDF = async () => {
    if (!selectedProspect) return;
    setExporting(true);
    try {
      await exportProspectToPDF(selectedProspect);
      showToast('success', 'PDF descargado');
    } catch (err: any) {
      console.error('❌ Error PDF:', err);
      showToast('error', 'Error PDF: ' + (err.message || ''), 5000);
    } finally {
      setExporting(false);
    }
  };

  // ----- Navegación
  const handleSelectProspect = (p: Prospect) => {
    setSelectedProspect(p);
    setView('detail');
  };

  const handleEditFromDetail = () => {
    if (!selectedProspect) return;
    setEditingId(selectedProspect.id);
    setView('form');
  };

  const handleAddNew = () => {
    setEditingId(null);
    setSelectedProspect(null);
    setView('form');
  };

  const handleCloseForm = () => {
    setEditingId(null);
    setView(selectedProspect ? 'detail' : 'dashboard');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedProspect(null);
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-white f-body">
      <FontStyles />

      <div
        className="mx-auto bg-neutral-950 min-h-screen relative overflow-hidden"
        style={{ maxWidth: '480px' }}
      >
        {view === 'dashboard' && (
          <Dashboard
            prospects={prospects}
            loading={loading}
            onAddNew={handleAddNew}
            onSelect={handleSelectProspect}
          />
        )}

        {view === 'detail' && selectedProspect && (
          <ProspectDetail
            prospect={selectedProspect}
            onBack={handleBackToDashboard}
            onEdit={handleEditFromDetail}
            onDelete={handleDeleteProspect}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onExportPDF={handleExportPDF}
            addingPhoto={addingPhoto}
            exporting={exporting}
          />
        )}

        {view === 'form' && (
          <EvaluationForm
            onClose={handleCloseForm}
            onSave={handleSaveProspect}
            saving={saving}
            isEditing={!!editingId}
            initialData={editingId && selectedProspect ? prospectToFormData(selectedProspect) : null}
          />
        )}

        <Toast toast={toast} />
      </div>

      {/* Componente printable oculto, sólo si hay prospecto seleccionado */}
      {selectedProspect && <PrintableProspect prospect={selectedProspect} />}
    </div>
  );
}