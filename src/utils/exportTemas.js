import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportTemas = async (selectedItem) => {
  console.log('Iniciando exportTemas:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('Temas')
      .select('*')
      .eq('id', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para el tema seleccionado')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID': data.id || '',
      'Nombre': data.nombre || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tema')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el nombre del tema para el archivo
    const nombreTema = data.nombre || `Tema_${data.id}`
    // Limpiar el nombre de caracteres especiales
    const nombreArchivo = nombreTema.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportTemas:', error)
    throw new Error(`Error al exportar los datos del tema: ${error.message}`)
  }
}
