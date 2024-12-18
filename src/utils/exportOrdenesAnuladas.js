import { supabase } from '../config/supabaseClient'
import * as XLSX from 'xlsx'
import { formatDate } from './formatters'

export const exportOrdenesAnuladas = async (selectedItem) => {
  console.log('Iniciando exportOrdenesAnuladas:', { selectedItem })
  
  try {
    // Primero obtenemos los años
    const { data: aniosData, error: aniosError } = await supabase
      .from('Anios')
      .select('id, years');

    if (aniosError) throw aniosError;

    const aniosMap = new Map(aniosData.map(a => [a.id, a.years]));
    console.log('Mapa de años:', Object.fromEntries(aniosMap));

    let query = supabase
      .from('OrdenesDePublicidad')
      .select(`
        *,
        Agencia:Agencias!id_agencia (id, RazonSocial),
        Cliente:Clientes!id_cliente (id_cliente, nombreCliente),
        Contratos:Contratos!id_contrato (id, nombreProducto),
        Plan:PlanesPublicidad!id_plan (id_planes_publicidad, NombrePlan),
        Proveedor:Proveedores!id_proveedor (id_proveedor, nombreProveedor),
        Soporte:Soportes!id_soporte (id_soporte, nombreIdentficiador),
        Tema:Temas!id_tema (id_tema, NombreTema, 
        Medio:Medios!id_medio (id, NombredelMedio)),
        Campania:Campania!id_campania (id_campania, NombreCampania),
        Clasificacion:ClasificacionMedios!id_clasificacion (id_clasificacion_medios, NombreClasificacion)
      `)
      .eq('estadoorden', 'Anulada')
      .order('numerodeorden', { ascending: true });

    // Si se seleccionó una orden específica, filtrar por ella
    if (selectedItem) {
      query = query.eq('id_ordenes_de_comprar', selectedItem);
    }

    const { data: ordenData, error: ordenError } = await query;

    if (ordenError) {
      console.error('Error en consulta:', ordenError);
      throw ordenError;
    }

    if (!ordenData || ordenData.length === 0) {
      console.error('No se encontraron órdenes anuladas');
      throw new Error('No se encontraron órdenes anuladas para exportar');
    }

    console.log(`Se encontraron ${ordenData.length} órdenes anuladas`);
    let excelData = [];
    let ordenesConError = 0;
    let ordenesProcesadas = 0;
    let ordenesConDatos = 0;
    
    // Procesar cada orden
    for (const orden of ordenData) {
      try {
        console.log(`Procesando orden anulada ${orden.numerodeorden}`);
        
        // Crear una fila básica incluso si no hay datos recopilados
        const baseRow = {
          'Número de Orden': orden.numerodeorden || '',
          'Estado': orden.estadoorden || '',
          'Descuento': 0,
          'Valor Neto': 0,
          'Valor Bruto': 0,
          'Valor Total': 0,
          'Número de Contrato': orden.num_contrato || '',
          'Producto': orden.Contratos?.nombreProducto || '',
          'Proveedor': orden.Proveedor?.nombreProveedor || '',
          'Cod Megatime': orden.Megatime || '',
          'Soporte': orden.Soporte?.nombreIdentficiador || '',
          'Tema': orden.Tema?.NombreTema || '',
          'Cod Medio': orden.Tema?.Medio?.NombredelMedio || '',
          'Campaña': orden.Campania?.NombreCampania || '',
          'Clasificación': orden.Clasificacion?.NombreClasificacion || '',
          'Cliente': orden.Cliente?.nombreCliente || '',
          'Plan de Medios': orden.Plan?.NombrePlan || '',
          'Agencia Creativa': orden.Agencia?.RazonSocial || '',
          'Usuario Registro': orden.usuarioregistro || '',
          'Fecha Creación': orden.created_at ? new Date(orden.created_at).toLocaleDateString() : '',
          'Numero de Orden Reemplaza': orden.numerodeordenremplaza || '',
          'ID Tema': '',
          'Segundos': '',
          'ID Programa': '',
          'ID Clasificación': '',
          'Día': '',
          'Mes': '',
          'Año': '',
          'Fecha Exhib./Pub.': '',
          'Cantidad': 0
        };

        let filasAgregadas = 0;
        
        // Intentar procesar datosrecopiladosb si existe
        if (orden.datosrecopiladosb) {
          let datosRecopilados;
          try {
            datosRecopilados = typeof orden.datosrecopiladosb === 'string' ? 
              JSON.parse(orden.datosrecopiladosb) : orden.datosrecopiladosb;
              
            console.log(`Datos recopilados para orden ${orden.numerodeorden}:`, {
              tieneCalendario: datosRecopilados?.datos?.some(d => d.calendario?.length > 0),
              cantidadDatos: datosRecopilados?.datos?.length || 0
            });

            if (datosRecopilados?.datos && Array.isArray(datosRecopilados.datos)) {
              datosRecopilados.datos.forEach(dato => {
                if (dato.calendario && Array.isArray(dato.calendario)) {
                  dato.calendario.forEach(fecha => {
                    const dia = String(fecha.dia).padStart(2, '0');
                    const mes = String(fecha.mes).padStart(2, '0');
                    const anio = aniosMap.get(Number(fecha.anio)) || '';
                    const fechaCompleta = `${dia}/${mes}/${anio}`;

                    const row = {
                      ...baseRow,
                      'Descuento': dato.descuento || 0,
                      'Valor Neto': dato.valor_neto || 0,
                      'Valor Bruto': dato.valor_bruto || 0,
                      'Valor Total': dato.valor_total || 0,
                      'ID Tema': dato.tema_id || '',
                      'Segundos': dato.segundos || '',
                      'ID Programa': dato.programa_id || '',
                      'ID Clasificación': dato.clasificacion || '',
                      'Día': dia,
                      'Mes': mes,
                      'Año': anio,
                      'Fecha Exhib./Pub.': fechaCompleta,
                      'Cantidad': fecha.cantidad || 0
                    };

                    excelData.push(row);
                    filasAgregadas++;
                  });
                }
              });

              if (filasAgregadas > 0 && datosRecopilados?.totales) {
                const totalesRow = {
                  'Número de Orden': `TOTALES (${orden.numerodeorden})`,
                  'Descuento': datosRecopilados.totales.descuento_total || 0,
                  'Valor Neto': datosRecopilados.totales.valor_neto_total || 0,
                  'Valor Bruto': datosRecopilados.totales.valor_bruto_total || 0,
                  'Valor Total': datosRecopilados.totales.valor_total_total || 0
                };
                excelData.push(totalesRow);
              }
            }
          } catch (error) {
            console.error(`Error al parsear datosrecopiladosb para orden ${orden.numerodeorden}:`, error);
          }
        }

        // Si no se agregaron filas con datos recopilados, agregar la fila base
        if (filasAgregadas === 0) {
          excelData.push(baseRow);
          console.log(`Agregando fila base para orden ${orden.numerodeorden}`);
        } else {
          ordenesConDatos++;
        }

        ordenesProcesadas++;
      } catch (parseError) {
        console.error('Error procesando orden:', {
          orden: orden.numerodeorden,
          error: parseError
        });
        ordenesConError++;
        
        // Aún así, agregar la fila base para esta orden
        excelData.push(baseRow);
      }
    }

    console.log('Resumen del procesamiento:', {
      totalOrdenes: ordenData.length,
      ordenesProcesadas,
      ordenesConDatos,
      ordenesConError,
      filasGeneradas: excelData.length
    });

    if (excelData.length === 0) {
      throw new Error(`No hay datos para exportar después de procesar las órdenes anuladas. 
        Total órdenes: ${ordenData.length}, 
        Procesadas: ${ordenesProcesadas}, 
        Con datos: ${ordenesConDatos}, 
        Con error: ${ordenesConError}`);
    }

    // Crear y exportar Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const maxWidth = 50;
    const colWidths = {};
    const headers = Object.keys(excelData[0]);
    
    headers.forEach(header => {
      colWidths[header] = Math.min(
        maxWidth,
        Math.max(
          header.length,
          ...excelData.map(row => String(row[header] || '').length)
        )
      );
    });

    worksheet['!cols'] = headers.map(header => ({ wch: colWidths[header] }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ordenes Anuladas');
    
    const fileName = `Ordenes_Anuladas_${formatDate(new Date())}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error('Error en exportOrdenesAnuladas:', error);
    throw error;
  }
}
