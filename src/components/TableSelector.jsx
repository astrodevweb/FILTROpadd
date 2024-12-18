import React from 'react'
import './TableSelector.css'

const tables = [
  { id: 'Agencias', name: 'Agencias' },
  { id: 'Clientes', name: 'Clientes' },
  { id: 'Proveedores', name: 'Proveedores' },
  { id: 'Campania', name: 'Campañas' },
  { id: 'OrdenesDePublicidad', name: 'Órdenes de Publicidad' },
  { id: 'Contratos', name: 'Contratos' },
  //{ id: 'Temas', name: 'Temas' },
  //{ id: 'PlanesPublicidad', name: 'Planes de Publicidad' },
  //{ id: 'Medios', name: 'Medios' },
  //{ id: 'ClasificacionMedios', name: 'Clasificación de Medios' },
  //{ id: 'Programas', name: 'Programas' }
]

const TableSelector = ({ selectedTable, onTableChange }) => {
  return (
    <div className="table-selector-container">
      <div className="table-selector-grid">
        {tables.map((table) => (
          <button
            key={table.id}
            className={`table-selector-button ${selectedTable === table.id ? 'selected' : ''}`}
            onClick={() => onTableChange(table.id)}
          >
            {table.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TableSelector
