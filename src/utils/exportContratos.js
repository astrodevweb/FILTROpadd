import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportContratos = async (selectedItem, startDate, endDate) => {
  console.log('Iniciando exportContratos:', { selectedItem, startDate, endDate })
  
  try {
    let query = supabase
      .from('Contratos')
      .select(`
        *,
        Cliente:Clientes!id_cliente (id_cliente, nombreCliente),
        Agencia:Agencias!IdAgencias (id, RazonSocial)
      `)
      .order('created_at', { ascending: false });

    // Si hay un selectedItem, filtramos por él
    if (selectedItem) {
      query = query.eq('id_contrato', selectedItem);
    }

    // Si hay fechas seleccionadas, filtramos por created_at
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data, error } = selectedItem ? await query.single() : await query;

    if (error) {
      console.error('Error en consulta Supabase:', error)
      throw error
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('No se encontraron datos para el contrato seleccionado')
    }

    const contratos = Array.isArray(data) ? data : [data];
    const formattedData = contratos.map(contrato => ({
      'ID Contrato': contrato.id,
      'Número Contrato': contrato.num_contrato,
      'Nombre Contrato': contrato.NombreContrato || 'N/A',
      'Nombre Cliente': contrato.Cliente?.nombreCliente || 'N/A',
      'Agencia Creativa': contrato.Agencia?.RazonSocial || 'N/A',
      'Producto': contrato.nombreProducto || 'N/A',
      'Fecha Inicio': formatDate(contrato.FechaInicio),
      'Fecha Fin': formatDate(contrato.FechaTermino),
      'Valor Neto': contrato.ValorNeto || '',
      'Valor Bruto': contrato.ValorBruto || '',
      'Descuento': contrato.Descuento1 || '',
      'Valor Total': contrato.ValorTotal || '',
      'Estado': contrato.Estado ? 'Activo' : 'Inactivo',
      'Observaciones': contrato.Observaciones || '',
      'Fecha Creación': formatDate(contrato.created_at)
    }));

    // Crear y configurar el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos')

    // Ajustar el ancho de las columnas
    const columnsWidth = Object.keys(formattedData[0]).map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnsWidth

    // Generar nombre de archivo
    const fileName = selectedItem 
      ? `Contrato_${contratos[0].num_contrato || contratos[0].id_contrato}_${formatDate(new Date())}.xlsx`
      : `Contratos_${formatDate(new Date())}.xlsx`;
    
    console.log('Guardando archivo:', fileName)
    
    XLSX.writeFile(workbook, fileName)
    console.log('Archivo guardado exitosamente')

    return true
  } catch (error) {
    console.error('Error detallado en exportContratos:', error)
    throw new Error(`Error al exportar los datos del contrato: ${error.message}`)
  }
}
