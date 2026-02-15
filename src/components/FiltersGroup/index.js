import './index.css'

const locationsList = [
  {locationId: 'HYDERABAD', label: 'Hyderabad'},
  {locationId: 'BANGALORE', label: 'Bangalore'},
  {locationId: 'CHENNAI', label: 'Chennai'},
  {locationId: 'DELHI', label: 'Delhi'},
  {locationId: 'MUMBAI', label: 'Mumbai'},
]

const FiltersGroup = props => {
  const {
    employmentTypesList = [],
    salaryRangesList = [],
    selectedEmploymentTypes = [],
    selectedSalaryRange = '',
    selectedLocations = [],
    onChangeEmploymentType = () => {},
    onChangeSalaryRange = () => {},
    onChangeLocation = () => {},
  } = props

  const renderEmploymentTypes = () =>
    (employmentTypesList || []).map(each => {
      const {employmentTypeId, label} = each
      return (
        <li key={employmentTypeId} className="filter-item">
          <input
            type="checkbox"
            id={employmentTypeId}
            value={employmentTypeId}
            checked={selectedEmploymentTypes.includes(employmentTypeId)}
            onChange={() => onChangeEmploymentType(employmentTypeId)}
            className="filter-input"
          />
          <label htmlFor={employmentTypeId} className="filter-label">
            {label}
          </label>
        </li>
      )
    })

  const renderSalaryRanges = () =>
    (salaryRangesList || []).map(each => {
      const {salaryRangeId, label} = each
      return (
        <li key={salaryRangeId} className="filter-item">
          <input
            type="radio"
            id={salaryRangeId}
            value={salaryRangeId}
            checked={selectedSalaryRange === salaryRangeId}
            onChange={() => onChangeSalaryRange(salaryRangeId)}
            className="filter-input"
          />
          <label htmlFor={salaryRangeId} className="filter-label">
            {label}
          </label>
        </li>
      )
    })

  const renderLocations = () =>
    locationsList.map(each => {
      const {locationId, label} = each
      return (
        <li key={locationId} className="filter-item">
          <input
            type="checkbox"
            id={locationId}
            value={locationId}
            checked={selectedLocations.includes(locationId)}
            onChange={() => onChangeLocation(locationId)}
            className="filter-input"
          />
          <label htmlFor={locationId} className="filter-label">
            {label}
          </label>
        </li>
      )
    })

  return (
    <div className="filters-container">
      <h1 className="filter-heading">Type of Employment</h1>
      <ul className="filters-list">{renderEmploymentTypes()}</ul>

      <hr className="separator" />

      <h1 className="filter-heading">Salary Range</h1>
      <ul className="filters-list">{renderSalaryRanges()}</ul>

      <hr className="separator" />

      <h1 className="filter-heading">Locations</h1>
      <ul className="filters-list">{renderLocations()}</ul>
    </div>
  )
}

export default FiltersGroup
