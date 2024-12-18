export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const getItemLabel = (item, selectedTable) => {
  if (selectedTable === 'Agencias') {
    return item.NombreDeFantasia || `Agencia ${item.id}`
  } else if (selectedTable === 'Clientes') {
    return item.nombreFantasia || item.nombreCliente || `Cliente ${item.id_cliente}`
  }
  return `Item ${item.id}`
}
