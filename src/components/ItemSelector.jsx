const getItemLabel = (item, selectedTable) => {
  switch (selectedTable) {
    case 'Agencias':
      return item.RazonSocial || `Agencia ${item.id}`
    case 'Clientes':
      return item.nombreCliente || `Cliente ${item.id_cliente}`
    case 'Proveedores':
      return item.razonSocial || `Proveedor ${item.id_proveedor}`
    case 'Campania':
      return item.NombreCampania || `Campaña ${item.id_campania}`
    case 'OrdenesDePublicidad':
      return `Orden N° ${item.numerodeorden}`
    default:
      return `Item ${item.id}`
  }
}

const getItemId = (item, selectedTable) => {
  switch (selectedTable) {
    case 'Clientes':
      return item.id_cliente
    case 'Proveedores':
      return item.id_proveedor
    case 'Campania':
      return item.id_campania
    case 'OrdenesDePublicidad':
      return item.id_ordenes_de_comprar
    case 'Agencias':
    default:
      return item.id
  }
}

const ItemSelector = ({ data, selectedItem, selectedTable, onItemSelect, disabled }) => {
  return (
    <select 
      value={selectedItem || ''} 
      onChange={(e) => onItemSelect(e.target.value)}
      className="data-select"
      disabled={disabled}
    >
      <option key="default" value="">Seleccione un item</option>
      {data && data.map((item) => {
        const itemId = getItemId(item, selectedTable)
        return (
          <option 
            key={`${selectedTable}-${itemId}`}
            value={itemId}
          >
            {getItemLabel(item, selectedTable)}
          </option>
        )
      })}
    </select>
  )
}

export default ItemSelector
