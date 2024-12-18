import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportAnios = async (selectedItem) => {
  console.log('Iniciando exportAnios:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('Anios')
      .select('*')
      .eq('id', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para el año seleccionado')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID': data.id || '',
      'Año': data.anio || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Año')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el año para el archivo
    const nombreArchivo = `Anio_${data.anio || data.id}`
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportAnios:', error)
    throw new Error(`Error al exportar los datos del año: ${error.message}`)
  }
}
