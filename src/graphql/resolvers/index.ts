import { jobPostResolvers } from './jobPost.resolver'
import { jobApplicationResolvers } from './jobApplication.resolver'
import { jobProfileResolvers } from './jobProfile.resolver'

export const resolvers = {
  Query: {
    ...jobPostResolvers.Query,
    ...jobApplicationResolvers.Query,
    ...jobProfileResolvers.Query,
  },
  Mutation: {
    ...jobPostResolvers.Mutation,
    ...jobApplicationResolvers.Mutation,
    ...jobProfileResolvers.Mutation,
  },
  JobPost: jobPostResolvers.JobPost,
  JobPostTag: jobPostResolvers.JobPostTag,
  JobApplication: jobApplicationResolvers.JobApplication,
  JobProfile: jobProfileResolvers.JobProfile,
}
