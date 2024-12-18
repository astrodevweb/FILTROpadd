import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportMedios = async (selectedItem) => {
  console.log('Iniciando exportMedios:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('Medios')
      .select('*')
      .eq('id_medio', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para el medio seleccionado')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID Medio': data.id_medio || '',
      'Nombre Medio': data.NombreMedio || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medio')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el nombre del medio para el archivo
    const nombreMedio = data.NombreMedio || `Medio_${data.id_medio}`
    // Limpiar el nombre de caracteres especiales
    const nombreArchivo = nombreMedio.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportMedios:', error)
    throw new Error(`Error al exportar los datos del medio: ${error.message}`)
  }
}
