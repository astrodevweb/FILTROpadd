import { useState } from 'react'
import { supabase } from '../config/supabaseClient'
import { exportAgencias } from '../utils/exportAgencias'
import { exportClientes } from '../utils/exportClientes'
import { exportProveedores } from '../utils/exportProveedores'
import { exportCampanias } from '../utils/exportCampanias'
import { exportOrdenesDePublicidad } from '../utils/exportOrdenesDePublicidad'
import { exportContratos } from '../utils/exportContratos'
import { exportTemas } from '../utils/exportTemas'
import { exportPlanes } from '../utils/exportPlanes'
import { exportMedios } from '../utils/exportMedios'
import { exportOrdenesAnuladas } from '../utils/exportOrdenesAnuladas'
import './DataExporter.css'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const exportData = async (selectedItem, selectedTable, startDate, endDate, exportAll = false) => {
  if (!exportAll && (!selectedItem || !selectedTable)) {
    throw new Error('Debe seleccionar un item para exportar')
  }

  console.log('Iniciando exportación:', { selectedItem, selectedTable, exportAll, startDate, endDate })

  try {
    let result
    switch (selectedTable) {
      case 'Agencias':
        result = await exportAgencias(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Clientes':
        result = await exportClientes(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Proveedores':
        result = await exportProveedores(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Campania':
        result = await exportCampanias(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'OrdenesDePublicidad':
        result = await exportOrdenesDePublicidad(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Contratos':
        result = await exportContratos(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Temas':
        result = await exportTemas(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Planes':
        result = await exportPlanes(exportAll ? null : selectedItem, startDate, endDate)
        break
      case 'Medios':
        result = await exportMedios(exportAll ? null : selectedItem, startDate, endDate)
        break
      default:
        throw new Error('Tabla no soportada para exportación')
    }
    console.log('Exportación completada:', result)
    return result
  } catch (error) {
    console.error('Error en exportData:', error)
    throw new Error(error.message || 'Error al exportar los datos')
  }
}

const DataExporter = ({ selectedItem, selectedTable, startDate, endDate, onExport, disabled }) => {
  const [exportAll, setExportAll] = useState(false)

  const handleExport = async () => {
    try {
      console.log('Iniciando handleExport:', { selectedItem, selectedTable, exportAll, startDate, endDate })
      const result = await exportData(selectedItem, selectedTable, startDate, endDate, exportAll)
      console.log('Exportación exitosa:', result)
      onExport && onExport()
    } catch (error) {
      console.error('Error en handleExport:', error)
      throw error
    }
  }

  const handleExportAnuladas = async () => {
    try {
      await exportOrdenesAnuladas(selectedItem)
      onExport && onExport()
    } catch (error) {
      console.error('Error en exportación de órdenes anuladas:', error)
      throw error
    }
  }

  return (
    <div className="export-container">
      {(selectedTable === 'Agencias' || selectedTable === 'Clientes' || 
        selectedTable === 'Proveedores' || selectedTable === 'Campania' ||
        selectedTable === 'OrdenesDePublicidad' || selectedTable === 'Contratos') && (
        <div className="export-checkbox-container">
          <input
            type="checkbox"
            id="exportAll"
            checked={exportAll}
            onChange={(e) => setExportAll(e.target.checked)}
            className="export-checkbox"
          />
          <label htmlFor="exportAll" className="export-checkbox-label">
            {selectedTable === 'Agencias' 
              ? 'Exportar todas las agencias' 
              : selectedTable === 'Clientes'
              ? 'Exportar todos los clientes'
              : selectedTable === 'Proveedores'
              ? 'Exportar todos los proveedores'
              : selectedTable === 'Campania'
              ? 'Exportar todas las campañas'
              : selectedTable === 'OrdenesDePublicidad'
              ? 'Exportar todas las órdenes de publicidad'
              : 'Exportar todos los contratos'}
          </label>
        </div>
      )}
      <button 
        className="export-button"
        onClick={handleExport}
        disabled={disabled && !exportAll}
      >
        Exportar a Excel
      </button>
      {selectedTable === 'OrdenesDePublicidad' && (
        <button 
          className="export-button"
          onClick={handleExportAnuladas}
        >
          Exportar Órdenes Anuladas
        </button>
      )}
    </div>
  )
}

export { exportData }
export default DataExporter
