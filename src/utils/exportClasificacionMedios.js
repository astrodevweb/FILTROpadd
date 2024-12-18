import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportClasificacionMedios = async (selectedItem) => {
  console.log('Iniciando exportClasificacionMedios:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('ClasificacionMedios')
      .select('*')
      .eq('id_clasificacion', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para la clasificación seleccionada')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID Clasificación': data.id_clasificacion || '',
      'Nombre Clasificación': data.NombreClasificacion || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clasificación')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el nombre de la clasificación para el archivo
    const nombreClasificacion = data.NombreClasificacion || `Clasificacion_${data.id_clasificacion}`
    // Limpiar el nombre de caracteres especiales
    const nombreArchivo = nombreClasificacion.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportClasificacionMedios:', error)
    throw new Error(`Error al exportar los datos de la clasificación: ${error.message}`)
  }
}
