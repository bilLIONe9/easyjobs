export const jobProfileTypeDefs = /* GraphQL */ `
  type JobProfile {
    id: ID!
    name: String!
    linkedin: String
    phone: String
    github: String
    location: String
    description: String
    details: String
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
    applicationCount: Int!
    resumeDraftCount: Int!
  }

  type ResumeDraft {
    id: ID!
    jobProfileId: ID!
    title: String!
    cvData: JSON!
    createdAt: String!
    updatedAt: String!
  }

  input CreateJobProfileInput {
    name: String!
    linkedin: String
    phone: String
    github: String
    location: String
    description: String
    details: String
    isDefault: Boolean
  }

  input UpdateJobProfileInput {
    name: String
    linkedin: String
    phone: String
    github: String
    location: String
    description: String
    details: String
    isDefault: Boolean
  }

  extend type Query {
    jobProfiles: [JobProfile!]!
    jobProfile(id: ID!): JobProfile
    profileResumeDrafts(profileId: ID!): [ResumeDraft!]!
    resumeDraft(id: ID!): ResumeDraft
  }

  extend type Mutation {
    createJobProfile(input: CreateJobProfileInput!): JobProfile!
    updateJobProfile(id: ID!, input: UpdateJobProfileInput!): JobProfile!
    deleteJobProfile(id: ID!): Boolean!
    createProfileResumeDraft(profileId: ID!, title: String!, cvData: JSON): ResumeDraft!
    updateProfileResumeDraft(id: ID!, title: String, cvData: JSON): ResumeDraft!
    deleteProfileResumeDraft(id: ID!): Boolean!
    updateResumeCvData(id: ID!, cvData: JSON!): ResumeDraft!
  }
`
