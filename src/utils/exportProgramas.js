import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportProgramas = async (selectedItem) => {
  console.log('Iniciando exportProgramas:', { selectedItem })
  
  try {
    const { data, error } = await supabase
      .from('Programas')
      .select(`
        *,
        Soporte:Soportes!id_soporte (id_soporte, nombreIdentficiador)
      `)
      .eq('id_programa', selectedItem)
      .single()

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data) {
      throw new Error('No se encontraron datos para el programa seleccionado')
    }

    console.log('Datos obtenidos:', data)

    const formattedData = {
      'ID Programa': data.id_programa || '',
      'Nombre Programa': data.NombrePrograma || '',
      'ID Soporte': data.id_soporte || '',
      'Soporte': data.Soporte?.nombreIdentficiador || '',
      'Descripción': data.descripcion || '',
      'Estado': data.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(data.created_at)
    }

    console.log('Datos formateados:', formattedData)

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet([formattedData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Programa')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Usar el nombre del programa para el archivo
    const nombrePrograma = data.NombrePrograma || `Programa_${data.id_programa}`
    // Limpiar el nombre de caracteres especiales
    const nombreArchivo = nombrePrograma.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${nombreArchivo}_${formatDate(new Date())}.xlsx`
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportProgramas:', error)
    throw new Error(`Error al exportar los datos del programa: ${error.message}`)
  }
}
