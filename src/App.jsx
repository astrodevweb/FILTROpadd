import { useState, useEffect } from 'react'
import TableSelector from './components/TableSelector'
import DataExporter from './components/DataExporter'
import { supabase } from './config/supabaseClient'
import './App.css'

function App() {
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (selectedTable && fechaInicio && fechaFin) {
      let query;

      switch (selectedTable) {
        case 'Agencias':
          query = supabase
            .from('Agencias')
            .select('id, RazonSocial')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Clientes':
          query = supabase
            .from('Clientes')
            .select('id_cliente, nombreCliente')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Proveedores':
          query = supabase
            .from('Proveedores')
            .select('id_proveedor, nombreProveedor')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Campania':
          query = supabase
            .from('Campania')
            .select('id_campania, NombreCampania')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'OrdenesDePublicidad':
          console.log('Consultando órdenes con fechas:', { fechaInicio, fechaFin })
          query = supabase
            .from('OrdenesDePublicidad')
            .select(`
              id_ordenes_de_comprar,
              numerodeorden,
              created_at,
              num_contrato,
              datosRecopiladosb
            `)
            .gte('created_at', `${fechaInicio}T00:00:00.000Z`)
            .lte('created_at', `${fechaFin}T23:59:59.999Z`)
            .order('numerodeorden', { ascending: true })
          break
        case 'Contratos':
          query = supabase
            .from('Contratos')
            .select('id, NombreContrato, num_contrato')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Temas':
          query = supabase
            .from('Temas')
            .select('id_tema, nombreTema')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Planes':
          query = supabase
            .from('Planes')
            .select('id_plan, nombrePlan')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        case 'Medios':
          query = supabase
            .from('Medios')
            .select('id_medio, nombreMedio')
            .gte('created_at', fechaInicio)
            .lte('created_at', fechaFin)
          break
        default:
          setItems([])
          return
      }

      query.then(({ data, error }) => {
        if (error) {
          console.error('Error al cargar items:', error)
          setItems([])
        } else {
          console.log('Datos recibidos:', { selectedTable, data })
          setItems(data || [])
        }
      })
    } else {
      setItems([])
    }
  }, [selectedTable, fechaInicio, fechaFin])

  const getItemId = (item) => {
    switch (selectedTable) {
      case 'Agencias':
        return item.id
      case 'Clientes':
        return item.id_cliente
      case 'Proveedores':
        return item.id_proveedor
      case 'Campania':
        return item.id_campania
      case 'OrdenesDePublicidad':
        return item.id_ordenes_de_comprar
      case 'Contratos':
        return item.id
      case 'Temas':
        return item.id_tema
      case 'Planes':
        return item.id_plan
      case 'Medios':
        return item.id_medio
      default:
        return item.id
    }
  }

  const getItemLabel = (item) => {
    switch (selectedTable) {
      case 'Agencias':
        return item.RazonSocial
      case 'Clientes':
        return item.nombreCliente
      case 'Proveedores':
        return item.nombreProveedor
      case 'Campania':
        return item.NombreCampania
      case 'OrdenesDePublicidad':
        return `N° Orden - ${item.numerodeorden}`
      case 'Contratos':
        return `${item.NombreContrato} - ${item.num_contrato}`
      case 'Temas':
        return item.nombreTema
      case 'Planes':
        return item.nombrePlan
      case 'Medios':
        return item.nombreMedio
      default:
        return ''
    }
  }

  return (
    <div className="app-container">
      <TableSelector 
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
      />
      
      <div className="content">
        <div className="date-selector">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="date-input"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="date-input"
          />
        </div>

        <select
          value={selectedItem || ''}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="item-selector"
        >
          <option value="">Seleccione un item</option>
          {items.length > 0 ? (
            items.map((item) => (
              <option key={getItemId(item)} value={getItemId(item)}>
                {getItemLabel(item)}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {!fechaInicio || !fechaFin 
                ? 'Seleccione un rango de fechas primero'
                : 'No hay items disponibles en este rango de fechas'}
            </option>
          )}
        </select>

        <DataExporter 
          selectedItem={selectedItem}
          selectedTable={selectedTable}
          startDate={fechaInicio}
          endDate={fechaFin}
          onExport={() => setMessage('Exportación completada exitosamente')}
          disabled={!selectedItem || !fechaInicio || !fechaFin}
        />
        
        {message && <p className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</p>}
      </div>
    </div>
  )
}

export default App
