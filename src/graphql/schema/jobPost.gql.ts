export const jobPostTypeDefs = /* GraphQL */ `
  type JobPost {
    id: ID!
    title: String!
    description: String!
    salary: String
    locations: [String!]!
    postedAt: String!
    postedBy: String!
    sourceUrl: String
    jobType: String
    jobSource: String
    status: String!
    createdAt: String!
    updatedAt: String!
    applications: [JobApplication!]!
    applicationCount: Int!
    savedProfileIds: [ID!]!
  }

  type JobPostPage {
    items: [JobPost!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type JobPostInsights {
    total: Int!
    active: Int!
    closed: Int!
    inappropriate: Int!
    savedToApply: Int!
  }

  input CreateJobPostInput {
    title: String!
    description: String!
    salary: String
    locations: [String!]!
    postedAt: String!
    postedBy: String!
    sourceUrl: String
    jobType: String
    jobSource: String
  }

  input UpdateJobPostInput {
    title: String
    description: String
    salary: String
    locations: [String!]!
    postedAt: String
    postedBy: String
    sourceUrl: String
    jobType: String
    jobSource: String
    status: String
  }

  input JobPostFilter {
    status: String
    search: String
    startDate: String
    excludeProfileIds: [ID]
    location: String
  }

  extend type Query {
    jobPosts(filter: JobPostFilter, page: Int, limit: Int): JobPostPage!
    jobPost(id: ID!): JobPost
    jobPostInsights: JobPostInsights!
    checkDuplicateJobPosts(title: String!, postedBy: String!, excludeId: ID): [JobPost!]!
  }

  extend type Mutation {
    createJobPost(input: CreateJobPostInput!): JobPost!
    updateJobPost(id: ID!, input: UpdateJobPostInput!): JobPost!
    setJobPostStatus(id: ID!, status: String!): JobPost!
    deleteJobPost(id: ID!): Boolean!
  }
`
