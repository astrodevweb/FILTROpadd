import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportPlanes = async (selectedItem) => {
  console.log('Iniciando exportPlanes:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('PlanesPublicidad')
      .select('*')
      .eq('id_planes_publicidad', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para el plan seleccionado')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID Plan': data.id_planes_publicidad || '',
      'Nombre Plan': data.NombrePlan || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plan')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el nombre del plan para el archivo
    const nombrePlan = data.NombrePlan || `Plan_${data.id_planes_publicidad}`
    // Limpiar el nombre de caracteres especiales
    const nombreArchivo = nombrePlan.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportPlanes:', error)
    throw new Error(`Error al exportar los datos del plan: ${error.message}`)
  }
}
