import { type } from "arktype";
import { multerFile } from "../../utils/commonInterface.utils";


export const createTeamValidator = type({
  userId: "string",
  teamName: "string",
  ourStory: "string",
  teamGoals: "string[]",
  achievement: "string",
  profileImage: multerFile.array(),
  coverImage: multerFile.array(),
  teamPhotos: multerFile.array(),
  teamVideos: multerFile.array(),
})

export type createTeamType = typeof createTeamValidator.infer

