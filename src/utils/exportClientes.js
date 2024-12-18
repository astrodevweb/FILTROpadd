import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'

export const exportClientes = async (selectedItem, startDate, endDate) => {
  try {
    let query = supabase
      .from('Clientes')
      .select(`
        *,
        region:Region!inner(id, nombreRegion),
        comuna:Comunas!inner(id_comuna, nombreComuna),
        tipo:TipoCliente!inner(id_tyipoCliente, nombreTipoCliente)
      `)

    // Si hay un item seleccionado, filtrar por ese ID
    if (selectedItem) {
      query = query.eq('id_cliente', selectedItem)
    }

    // Aplicar filtro de fechas
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: clientesData, error: clienteError } = await query

    if (clienteError) throw clienteError
    if (!clientesData || clientesData.length === 0) {
      throw new Error('No se encontraron clientes para los criterios especificados')
    }

    const excelData = clientesData.map(clienteData => ({
      'ID Cliente': clienteData.id_cliente || '',
      'Fecha Creación': clienteData.created_at ? new Date(clienteData.created_at).toLocaleDateString() : '',
      'Nombre Cliente': clienteData.nombreCliente || '',
      'Nombre Fantasía': clienteData.nombreFantasia || '',
      'Razón Social': clienteData.razonSocial || '',
      'Tipo Cliente': clienteData.tipo?.nombreTipoCliente || '',
      'Grupo': clienteData.grupo || '',
      'RUT': clienteData.RUT || '',
      'Giro': clienteData.giro || '',
      'Nombre Representante Legal': clienteData.nombreRepresentanteLegal || '',
      'Apellido Representante': clienteData.apellidoRepresentante || '',
      'RUT Representante': clienteData.RUT_representante || '',
      'Dirección Empresa': clienteData.direccionEmpresa || '',
      'Región': clienteData.region?.nombreRegion || '',
      'Comuna': clienteData.comuna?.nombreComuna || '',
      'Teléfono Celular': clienteData.telCelular || '',
      'Teléfono Fijo': clienteData.telFijo || '',
      'Email': clienteData.email || '',
      'Web Cliente': clienteData.web_cliente || '',
      'Estado': clienteData.estado ? 'Activo' : 'Inactivo'
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')

    const fileName = selectedItem
      ? `Cliente_${clientesData[0].nombreCliente}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
      : `Todos_los_Clientes_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`

    XLSX.writeFile(workbook, fileName)
    return { success: true, message: 'Archivo exportado exitosamente' }
  } catch (error) {
    console.error('Error al exportar cliente:', error)
    throw error
  }
}
