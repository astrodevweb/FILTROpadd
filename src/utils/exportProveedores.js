import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'

export const exportProveedores = async (selectedItem, startDate, endDate) => {
  console.log('Iniciando exportProveedores:', { selectedItem, startDate, endDate })
  
  try {
    let query = supabase
      .from('Proveedores')
      .select(`
        *,
        Region:Region!id_region (id, nombreRegion),
        Comuna:Comunas!id_comuna (id_comuna, nombreComuna)
      `)

    // Si hay un item seleccionado, filtrar por ese ID
    if (selectedItem) {
      query = query.eq('id_proveedor', selectedItem)
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

    const excelData = data.map(proveedor => ({
      'ID Proveedor': proveedor.id_proveedor || '',
      'Fecha Creación': proveedor.created_at ? new Date(proveedor.created_at).toLocaleDateString() : '',
      'Nombre Proveedor': proveedor.nombreProveedor || '',
      'Razón Social': proveedor.razonSocial || '',
      'Nombre Fantasía': proveedor.nombreFantasia || '',
      'RUT Proveedor': proveedor.rutProveedor || '',
      'Giro Proveedor': proveedor.giroProveedor || '',
      'Nombre Representante': proveedor.nombreRepresentante || '',
      'RUT Representante': proveedor.rutRepresentante || '',
      'Dirección Facturación': proveedor.direccionFacturacion || '',
      //'ID Región': proveedor.id_region || '',
      'Región': proveedor.Region?.nombreRegion || '',
      //'ID Comuna': proveedor.id_comuna || '',
      'Comuna': proveedor.Comuna?.nombreComuna || '',
      'Teléfono Celular': proveedor.telCelular || '',
      'Teléfono Fijo': proveedor.telFijo || '',
      'Email': proveedor.email || '',
      'Estado': proveedor.estado ? 'Activo' : 'Inactivo',
      'Nombre Identificador': proveedor.nombreIdentificador || '',
      'Bonificación Año': proveedor.bonificacion_ano || '',
      'Escala Rango': proveedor.escala_rango || ''
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores')

    const fileName = selectedItem
      ? `Proveedor_${data[0].nombreProveedor}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
      : `Todos_los_Proveedores_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`

    XLSX.writeFile(workbook, fileName)
    return { success: true, message: 'Archivo exportado exitosamente' }
  } catch (error) {
    console.error('Error detallado en exportProveedores:', error)
    throw error
  }
}
