import { gql } from '@apollo/client/core'

// ─── Job Posts ───────────────────────────────────────────────────────────────

export const JOB_POSTS_QUERY = gql`
  query JobPosts($filter: JobPostFilter, $page: Int, $limit: Int) {
    jobPosts(filter: $filter, page: $page, limit: $limit) {
      items {
        id
        title
        salary
        location
        postedAt
        postedBy
        sourceUrl
        status
        applicationCount
        savedProfileIds
        createdAt
      }
      total
      page
      totalPages
    }
  }
`

export const JOB_POST_QUERY = gql`
  query JobPost($id: ID!) {
    jobPost(id: $id) {
      id
      title
      description
      salary
      location
      postedAt
      postedBy
      sourceUrl
      status
      applicationCount
      createdAt
      updatedAt
    }
  }
`

export const JOB_POST_INSIGHTS_QUERY = gql`
  query JobPostInsights {
    jobPostInsights {
      total
      active
      closed
      inappropriate
      savedToApply
    }
  }
`

export const CREATE_JOB_POST = gql`
  mutation CreateJobPost($input: CreateJobPostInput!) {
    createJobPost(input: $input) {
      id
      title
      status
      createdAt
    }
  }
`

export const UPDATE_JOB_POST = gql`
  mutation UpdateJobPost($id: ID!, $input: UpdateJobPostInput!) {
    updateJobPost(id: $id, input: $input) {
      id
      title
      status
    }
  }
`

export const SET_JOB_POST_STATUS = gql`
  mutation SetJobPostStatus($id: ID!, $status: String!) {
    setJobPostStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

export const DELETE_JOB_POST = gql`
  mutation DeleteJobPost($id: ID!) {
    deleteJobPost(id: $id)
  }
`

// ─── Job Applications ─────────────────────────────────────────────────────────

export const JOB_APPLICATIONS_QUERY = gql`
  query JobApplications($filter: ApplicationFilter, $page: Int, $limit: Int) {
    jobApplications(filter: $filter, page: $page, limit: $limit) {
      items {
        id
        currentStatus
        cvGenerationStatus
        createdAt
        updatedAt
        jobPost {
          id
          title
          postedBy
          location
          salary
        }
        jobProfile {
          id
          name
        }
        resume {
          id
          title
        }
      }
      total
      page
      totalPages
    }
  }
`

export const JOB_APPLICATION_QUERY = gql`
  query JobApplication($id: ID!) {
    jobApplication(id: $id) {
      id
      currentStatus
      cvData
      cvGenerationStatus
      coverLetter
      notes
      createdAt
      updatedAt
      jobPost {
        id
        title
        description
        salary
        location
        postedBy
        postedAt
        sourceUrl
      }
      jobProfile {
        id
        name
        linkedin
        github
        phone
        location
      }
      resume {
        id
        title
      }
      statusHistory {
        id
        status
        changedAt
        note
        durationFromPreviousMinutes
      }
      customQuestions {
        id
        question
        answer
        questionType
        sortOrder
      }
    }
  }
`

export const APPLICATION_INSIGHTS_QUERY = gql`
  query ApplicationInsights($startDate: String, $endDate: String) {
    applicationInsights(startDate: $startDate, endDate: $endDate) {
      totalApplications
      cvReadyCount
      byStatus {
        status
        count
      }
      avgDaysByStatus {
        fromStatus
        toStatus
        avgDays
      }
      recentStatusChanges {
        applicationId
        jobTitle
        toStatus
        changedAt
        daysSinceChange
      }
    }
  }
`

export const SAVE_JOB_POST_TO_APPLY = gql`
  mutation SaveJobPostToApply($jobPostId: ID!, $profileId: ID) {
    saveJobPostToApply(jobPostId: $jobPostId, profileId: $profileId) {
      id
      currentStatus
      cvGenerationStatus
    }
  }
`

export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: ID!, $status: String!, $note: String) {
    updateApplicationStatus(id: $id, status: $status, note: $note) {
      id
      currentStatus
      statusHistory {
        id
        status
        changedAt
        note
        durationFromPreviousMinutes
      }
    }
  }
`

export const UPDATE_APPLICATION = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      coverLetter
      notes
      cvData
      jobProfile {
        id
        name
      }
      resume {
        id
        title
      }
      customQuestions {
        id
        question
        answer
        questionType
        sortOrder
      }
    }
  }
`

export const DELETE_APPLICATION = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id)
  }
`

export const DELETE_APPLICATION_QUESTION = gql`
  mutation DeleteApplicationQuestion($id: ID!) {
    deleteApplicationQuestion(id: $id)
  }
`

// ─── Job Profiles ─────────────────────────────────────────────────────────────

export const JOB_PROFILES_QUERY = gql`
  query JobProfiles {
    jobProfiles {
      id
      name
      linkedin
      phone
      github
      location
      description
      details
      isDefault
      applicationCount
      resumeDraftCount
      createdAt
    }
  }
`

export const PROFILE_RESUME_DRAFTS_QUERY = gql`
  query ProfileResumeDrafts($profileId: ID!) {
    profileResumeDrafts(profileId: $profileId) {
      id
      jobProfileId
      title
      cvData
      createdAt
      updatedAt
    }
  }
`

export const CREATE_PROFILE_RESUME_DRAFT = gql`
  mutation CreateProfileResumeDraft($profileId: ID!, $title: String!, $cvData: JSON) {
    createProfileResumeDraft(profileId: $profileId, title: $title, cvData: $cvData) {
      id
      jobProfileId
      title
      cvData
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_PROFILE_RESUME_DRAFT = gql`
  mutation UpdateProfileResumeDraft($id: ID!, $title: String, $cvData: JSON) {
    updateProfileResumeDraft(id: $id, title: $title, cvData: $cvData) {
      id
      jobProfileId
      title
      cvData
      updatedAt
    }
  }
`

export const DELETE_PROFILE_RESUME_DRAFT = gql`
  mutation DeleteProfileResumeDraft($id: ID!) {
    deleteProfileResumeDraft(id: $id)
  }
`

export const CREATE_JOB_PROFILE = gql`
  mutation CreateJobProfile($input: CreateJobProfileInput!) {
    createJobProfile(input: $input) {
      id
      name
      isDefault
    }
  }
`

export const UPDATE_JOB_PROFILE = gql`
  mutation UpdateJobProfile($id: ID!, $input: UpdateJobProfileInput!) {
    updateJobProfile(id: $id, input: $input) {
      id
      name
      linkedin
      phone
      github
      location
      description
      details
      isDefault
    }
  }
`

export const DELETE_JOB_PROFILE = gql`
  mutation DeleteJobProfile($id: ID!) {
    deleteJobProfile(id: $id)
  }
`
