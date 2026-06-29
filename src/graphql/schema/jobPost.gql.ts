export const jobPostTypeDefs = /* GraphQL */ `
  type JobPostTag {
    id: ID!
    label: String!
    value: String!
  }

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
    tags: [JobPostTag!]!
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
    tagIds: [ID!]
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
    tagIds: [ID!]
  }

  input JobPostFilter {
    status: String
    search: String
    startDate: String
    createdAfter: String
    excludeProfileIds: [ID]
    location: String
    tags: [String!]
  }

  extend type Query {
    jobPosts(filter: JobPostFilter, page: Int, limit: Int): JobPostPage!
    jobPost(id: ID!): JobPost
    jobPostInsights: JobPostInsights!
    checkDuplicateJobPosts(title: String!, postedBy: String!, excludeId: ID): [JobPost!]!
    jobPostTags: [JobPostTag!]!
  }

  extend type Mutation {
    createJobPost(input: CreateJobPostInput!): JobPost!
    updateJobPost(id: ID!, input: UpdateJobPostInput!): JobPost!
    setJobPostStatus(id: ID!, status: String!): JobPost!
    deleteJobPost(id: ID!): Boolean!
    createJobPostTag(label: String!): JobPostTag!
    setJobPostTags(jobPostId: ID!, tagIds: [ID!]!): JobPost!
  }
`
