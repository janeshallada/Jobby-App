import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'

import Header from '../Header'
import ProfileCard from '../ProfileCard'
import FiltersGroup from '../FiltersGroup'
import JobCard from '../JobCard'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

const salaryRangesList = [
  {salaryRangeId: '1000000', label: '10 LPA and above'},
  {salaryRangeId: '2000000', label: '20 LPA and above'},
  {salaryRangeId: '3000000', label: '30 LPA and above'},
  {salaryRangeId: '4000000', label: '40 LPA and above'},
]

class Jobs extends Component {
  state = {
    profileStatus: apiStatusConstants.initial,
    jobsStatus: apiStatusConstants.initial,
    profileDetails: {},
    jobsList: [],
    searchInput: '',
    activeEmploymentTypes: [],
    activeSalaryRange: '',
    activeLocations: [],
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  getProfileDetails = async () => {
    this.setState({profileStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updatedData = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profileDetails: updatedData,
        profileStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({jobsStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {
      searchInput,
      activeEmploymentTypes,
      activeSalaryRange,
      activeLocations,
    } = this.state

    const employmentTypesQuery = activeEmploymentTypes.join(',')
    const locationsQuery = activeLocations.join(',')

    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypesQuery}&minimum_package=${activeSalaryRange}&location=${locationsQuery}&search=${searchInput}`

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const updatedJobs = (data.jobs || []).map(each => ({
        id: each.id,
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))
      this.setState({
        jobsList: updatedJobs,
        jobsStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsStatus: apiStatusConstants.failure})
    }
  }

  onRetryProfile = () => {
    this.getProfileDetails()
  }

  onRetryJobs = () => {
    this.getJobs()
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onClickSearch = () => {
    this.getJobs()
  }

  onKeyDownSearch = event => {
    if (event.key === 'Enter') {
      this.getJobs()
    }
  }

  onChangeEmploymentType = id => {
    this.setState(prevState => {
      const {activeEmploymentTypes} = prevState
      if (activeEmploymentTypes.includes(id)) {
        return {
          activeEmploymentTypes: activeEmploymentTypes.filter(
            each => each !== id,
          ),
        }
      }
      return {
        activeEmploymentTypes: [...activeEmploymentTypes, id],
      }
    }, this.getJobs)
  }

  onChangeSalaryRange = id => {
    this.setState({activeSalaryRange: id}, this.getJobs)
  }

  onChangeLocation = id => {
    this.setState(prevState => {
      const {activeLocations} = prevState
      if (activeLocations.includes(id)) {
        return {
          activeLocations: activeLocations.filter(each => each !== id),
        }
      }
      return {
        activeLocations: [...activeLocations, id],
      }
    }, this.getJobs)
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderProfileSuccess = () => {
    const {profileDetails} = this.state
    return <ProfileCard profileDetails={profileDetails} />
  }

  renderProfileFailure = () => (
    <div className="profile-failure-container">
      <button type="button" className="retry-btn" onClick={this.onRetryProfile}>
        Retry
      </button>
    </div>
  )

  renderProfileSection = () => {
    const {profileStatus} = this.state
    switch (profileStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderProfileSuccess()
      case apiStatusConstants.failure:
        return this.renderProfileFailure()
      default:
        return null
    }
  }

  renderJobsSuccess = () => {
    const {jobsList = [], activeLocations = []} = this.state

    const filteredJobs =
      activeLocations.length === 0
        ? jobsList
        : jobsList.filter(eachJob =>
            activeLocations.includes(eachJob.location.toUpperCase()),
          )

    if (filteredJobs.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-img"
          />
          <h1 className="no-jobs-heading">No Jobs Found</h1>
          <p className="no-jobs-description">
            We could not find any jobs. Try other filters.
          </p>
        </div>
      )
    }

    return (
      <ul className="jobs-list">
        {filteredJobs.map(each => (
          <JobCard key={each.id} jobDetails={each} />
        ))}
      </ul>
    )
  }

  renderJobsFailure = () => (
    <div className="jobs-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-img"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for
      </p>
      <button type="button" className="retry-btn" onClick={this.onRetryJobs}>
        Retry
      </button>
    </div>
  )

  renderJobsSection = () => {
    const {jobsStatus} = this.state
    switch (jobsStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderJobsSuccess()
      case apiStatusConstants.failure:
        return this.renderJobsFailure()
      default:
        return null
    }
  }

  renderSearchBar = () => {
    const {searchInput} = this.state
    return (
      <div className="search-container">
        <input
          type="search"
          className="search-input"
          placeholder="Search"
          value={searchInput}
          onChange={this.onChangeSearchInput}
          onKeyDown={this.onKeyDownSearch}
        />
        <button
          type="button"
          className="search-btn"
          data-testid="searchButton"
          onClick={this.onClickSearch}
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  render() {
    const {
      activeEmploymentTypes,
      activeSalaryRange,
      activeLocations,
    } = this.state

    return (
      <>
        <Header />
        <div className="jobs-bg">
          <div className="jobs-content">
            <div className="filters-section">
              {this.renderProfileSection()}
              <hr className="filters-separator" />
              <FiltersGroup
                employmentTypesList={employmentTypesList}
                salaryRangesList={salaryRangesList}
                selectedEmploymentTypes={activeEmploymentTypes}
                selectedSalaryRange={activeSalaryRange}
                selectedLocations={activeLocations}
                onChangeEmploymentType={this.onChangeEmploymentType}
                onChangeSalaryRange={this.onChangeSalaryRange}
                onChangeLocation={this.onChangeLocation}
              />
            </div>
            <div className="jobs-section">
              <div className="search-bar-lg">{this.renderSearchBar()}</div>
              <div className="search-bar-sm">{this.renderSearchBar()}</div>
              {this.renderJobsSection()}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
