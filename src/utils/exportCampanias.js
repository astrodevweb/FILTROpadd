import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'

export const exportCampanias = async (selectedItem, startDate, endDate) => {
  console.log('Iniciando exportCampanias:', { selectedItem, startDate, endDate })
  
  try {
    let query = supabase
      .from('Campania')
      .select(`
        *,
        cliente:Clientes!id_Cliente (nombreCliente),
        agencia:Agencias!Id_Agencia (id, RazonSocial),
        producto:Productos!id_Producto (id, NombreDelProducto),
        plan:PlanesPublicidad!Id_Planes_Publicidad (id_planes_publicidad,NombrePlan),
        anio:Anios!Anio (id, years)
      `)

    // Si hay un item seleccionado, filtrar por ese ID
    if (selectedItem) {
      query = query.eq('id_campania', selectedItem)
    }

    // Aplicar filtro de fechas
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('No se encontraron datos para los criterios especificados')
    }

    console.log('Datos obtenidos:', data)

    const excelData = data.map(campania => ({
      'ID Campaña': campania.id_campania || '',
      'Nombre Campaña': campania.NombreCampania || '',
      'Año': campania.anio?.years || '',
      'Cliente': campania.cliente?.nombreCliente || '',
      'Agencia': campania.agencia?.RazonSocial || '',
      'Producto': campania.producto?.NombreDelProducto || '',
      'Presupuesto': campania.Presupuesto || '',
      'Plan de Publicidad': campania.plan?.NombrePlan || '',
      'Estado': campania.estado ? 'Activo' : 'Inactivo',
      //'Fecha Creación': campania.fechaCreacion ? new Date(campania.fechaCreacion).toLocaleDateString() : '',
      'Fecha Registro': campania.created_at ? new Date(campania.created_at).toLocaleDateString() : ''
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Ajustar el ancho de las columnas
    const columnWidths = {}
    excelData.forEach(row => {
      Object.keys(row).forEach(key => {
        const length = row[key] ? row[key].toString().length : 10
        columnWidths[key] = Math.max(columnWidths[key] || 0, length)
      })
    })

    worksheet['!cols'] = Object.keys(columnWidths).map(key => ({
      wch: columnWidths[key] + 2
    }))

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campañas')

    const fileName = selectedItem
      ? `Campaña_${data[0].NombreCampania}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
      : `Todas_las_Campañas_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`

    XLSX.writeFile(workbook, fileName)
    return { success: true, message: 'Archivo exportado exitosamente' }
  } catch (error) {
    console.error('Error detallado en exportCampanias:', error)
    throw error
  }
}
