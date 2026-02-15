import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {AiFillStar} from 'react-icons/ai'
import {MdLocationOn} from 'react-icons/md'
import {BsBriefcaseFill} from 'react-icons/bs'
import {FiExternalLink} from 'react-icons/fi'

import Header from '../Header'
import SimilarJobItem from '../SimilarJobItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: null,
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {match} = this.props
    const {id} = match.params

    const url = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const job = data.job_details || {}

      const updatedJob = {
        id: job.id || '',
        companyLogoUrl: job.company_logo_url || '',
        companyWebsiteUrl: job.company_website_url || '',
        employmentType: job.employment_type || '',
        jobDescription: job.job_description || '',
        location: job.location || '',
        packagePerAnnum: job.package_per_annum || '',
        rating: job.rating || '',
        title: job.title || '',
        skills: (job.skills || []).map(each => ({
          name: each.name,
          imageUrl: each.image_url,
        })),
        lifeAtCompany: {
          description: job.life_at_company?.description || '',
          imageUrl: job.life_at_company?.image_url || '',
        },
      }

      const updatedSimilarJobs = (data.similar_jobs || []).map(each => ({
        id: each.id,
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        location: each.location,
        rating: each.rating,
        title: each.title,
      }))

      this.setState({
        jobDetails: updatedJob,
        similarJobs: updatedSimilarJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onRetry = () => {
    this.getJobDetails()
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="job-details-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-img"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for
      </p>
      <button type="button" className="retry-btn" onClick={this.onRetry}>
        Retry
      </button>
    </div>
  )

  renderSuccessView = () => {
    const {jobDetails, similarJobs} = this.state

    if (!jobDetails) {
      return null
    }

    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      location,
      packagePerAnnum,
      rating,
      title,
      skills = [],
      lifeAtCompany = {description: '', imageUrl: ''},
    } = jobDetails

    return (
      <div className="job-details-container">
        <div className="job-details-card">
          <div className="job-header">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="job-company-logo"
            />
            <div>
              <h1 className="job-title">{title}</h1>
              <div className="rating-container">
                <AiFillStar className="star-icon" />
                <p className="rating-text">{rating}</p>
              </div>
            </div>
          </div>
          <div className="job-meta-container">
            <div className="location-employment">
              <div className="meta-item">
                <MdLocationOn className="meta-icon" />
                <p className="meta-text">{location}</p>
              </div>
              <div className="meta-item">
                <BsBriefcaseFill className="meta-icon" />
                <p className="meta-text">{employmentType}</p>
              </div>
            </div>
            <p className="package-text">{packagePerAnnum}</p>
          </div>
          <hr className="job-separator" />
          <div className="description-header">
            <h1 className="job-description-heading">Description</h1>
            <a
              href={companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              Visit
              <FiExternalLink className="visit-icon" />
            </a>
          </div>
          <p className="job-description">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {(skills || []).map(each => (
              <li key={each.name} className="skill-item">
                <img
                  src={each.imageUrl}
                  alt={each.name}
                  className="skill-img"
                />
                <p className="skill-name">{each.name}</p>
              </li>
            ))}
          </ul>
          <div className="life-at-company-container">
            <div className="life-text-container">
              <h1 className="life-heading">Life at Company</h1>
              <p className="life-description">{lifeAtCompany.description}</p>
            </div>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-img"
            />
          </div>
        </div>

        <div className="similar-jobs-section">
          <h1 className="similar-jobs-heading">Similar Jobs</h1>
          <ul className="similar-jobs-list">
            {(similarJobs || []).map(each => (
              <SimilarJobItem key={each.id} jobDetails={each} />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  renderJobDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-details-bg">{this.renderJobDetails()}</div>
      </>
    )
  }
}

export default JobItemDetails
