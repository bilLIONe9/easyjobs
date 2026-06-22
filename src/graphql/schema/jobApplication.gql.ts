export const jobApplicationTypeDefs = /* GraphQL */ `
  type JobApplication {
    id: ID!
    jobPost: JobPost!
    jobProfile: JobProfile
    currentStatus: String!
    cvGenerationStatus: String
    resume: ResumeRef
    coverLetter: String
    notes: String
    statusHistory: [ApplicationStatusHistory!]!
    customQuestions: [ApplicationQuestion!]!
    createdAt: String!
    updatedAt: String!
  }

  type ApplicationStatusHistory {
    id: ID!
    status: String!
    changedAt: String!
    note: String
    durationFromPreviousMinutes: Int
  }

  type ApplicationQuestion {
    id: ID!
    question: String!
    answer: String
    questionType: String!
    sortOrder: Int!
  }

  type ResumeRef {
    id: ID!
    title: String!
  }

  type ApplicationPage {
    items: [JobApplication!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type ApplicationInsights {
    totalApplications: Int!
    byStatus: [StatusCount!]!
    cvReadyCount: Int!
    avgDaysByStatus: [AvgDaysByStatus!]!
    recentStatusChanges: [RecentStatusChange!]!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type AvgDaysByStatus {
    fromStatus: String!
    toStatus: String!
    avgDays: Float!
  }

  type RecentStatusChange {
    applicationId: ID!
    jobTitle: String!
    fromStatus: String
    toStatus: String!
    changedAt: String!
    daysSinceChange: Int!
  }

  input CreateApplicationInput {
    jobPostId: ID!
    jobProfileId: ID
    notes: String
  }

  input UpdateApplicationInput {
    jobProfileId: ID
    coverLetter: String
    notes: String
    resumeId: ID
    customQuestions: [QuestionInput!]
  }

  input QuestionInput {
    id: ID
    question: String!
    answer: String
    questionType: String
    sortOrder: Int
  }

  input ApplicationFilter {
    status: String
    profileId: ID
    profileIds: [ID]
    resumeId: ID
    cvReady: Boolean
    startDate: String
    search: String
    company: String
  }

  extend type Query {
    jobApplications(filter: ApplicationFilter, page: Int, limit: Int): ApplicationPage!
    jobApplication(id: ID!): JobApplication
    applicationInsights(startDate: String, endDate: String): ApplicationInsights!
  }

  extend type Mutation {
    saveJobPostToApply(jobPostId: ID!, profileId: ID): JobApplication!
    updateApplicationStatus(id: ID!, status: String!, note: String): JobApplication!
    updateApplication(id: ID!, input: UpdateApplicationInput!): JobApplication!
    deleteApplicationQuestion(id: ID!): Boolean!
    deleteApplication(id: ID!): Boolean!
    # Enqueues a CV generation job for the external generator service to pick up
    generateCV(applicationId: ID!): JobApplication!
    # Called by the external generator service when CV generation is complete
    createResumeFromCV(applicationId: ID!, cvData: JSON!): JobApplication!
    # Called by the external generator service when CV generation fails
    reportCVGenerationFailed(applicationId: ID!, reason: String): JobApplication!
  }
`
