const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="date-filters">
      <div className="date-input">
        <label htmlFor="startDate">Fecha Inicio:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={endDate || undefined}
        />
      </div>
      <div className="date-input">
        <label htmlFor="endDate">Fecha Fin:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || undefined}
        />
      </div>
    </div>
  )
}

export default DateRangePicker
