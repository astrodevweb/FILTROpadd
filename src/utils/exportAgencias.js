import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'

export const exportAgencias = async (selectedItem, startDate, endDate) => {
  try {
    let query = supabase
      .from('Agencias')
      .select(`
        *,
        Region:Region!Region (nombreRegion),
        Comuna:Comunas!Comuna (nombreComuna)
      `)

    // Si hay un item seleccionado, filtrar por ese ID
    if (selectedItem) {
      query = query.eq('id', selectedItem)
    }

    // Aplicar filtro de fechas
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: agenciasData, error: agenciaError } = await query

    if (agenciaError) throw agenciaError
    if (!agenciasData || agenciasData.length === 0) {
      throw new Error('No se encontraron agencias para los criterios especificados')
    }

    const excelData = agenciasData.map(agenciaData => ({
      'ID': agenciaData.id || '',
      'Razón Social': agenciaData.RazonSocial || '',
      'Nombre de Fantasía': agenciaData.NombreDeFantasia || '',
      'Nombre Identificador': agenciaData.NombreIdentificador || '',
      'RUT Agencia': agenciaData.RutAgencia || '',
      'Giro': agenciaData.Giro || '',
      'Nombre Representante Legal': agenciaData.NombreRepresentanteLegal || '',
      'RUT Representante': agenciaData.rutRepresentante || '',
      'Dirección': agenciaData.DireccionAgencia || '',
      'Región': agenciaData.Region?.nombreRegion || '',
      'Comuna': agenciaData.Comuna?.nombreComuna || '',
      'Teléfono Celular': agenciaData.telCelular || '',
      'Teléfono Fijo': agenciaData.telFijo || '',
      'Email': agenciaData.Email || '',
      'Estado': agenciaData.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': agenciaData.created_at ? new Date(agenciaData.created_at).toLocaleDateString() : ''
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agencias')
    
    const fileName = selectedItem 
      ? `Agencia_${agenciasData[0].NombreIdentificador}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
      : `Todas_las_Agencias_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`

    XLSX.writeFile(workbook, fileName)
    return { success: true, message: 'Archivo exportado exitosamente' }
  } catch (error) {
    console.error('Error al exportar agencia:', error)
    throw error
  }
}
