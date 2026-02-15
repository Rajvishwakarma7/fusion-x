import { type } from 'arktype';
import { multerFile } from '../../utils/commonInterface.utils';

export const getAllTeamsValidator = type({
  page: 'number',
  pageSize: 'number',
  search: 'string?',
});

export type getAllTeamsType = typeof getAllTeamsValidator.infer;

export const getTeamByIdValidator = type({
  teamId:'string'
})

export type getTeamByIdType = typeof getTeamByIdValidator.infer

export const createTeamValidator = type({
  userId: 'string',
  teamName: 'string',
  ourStory: 'string',
  teamGoals: 'string[]',
  achievement: 'string',
  profileImage: multerFile.array(),
  coverImage: multerFile.array(),
  teamPhotos: multerFile.array(),
  teamVideos: multerFile.array(),
});

export type createTeamType = typeof createTeamValidator.infer;

export const uploadTeamMediaValidator = type({
  teamId: 'string',
  teamPhotos: multerFile.array(),
  teamVideos: multerFile.array(),
});

export type uploadTeamMediaType = typeof uploadTeamMediaValidator.infer;


export const updateTeamMediaValidator = type({
  teamMediaId: 'string',
  teamMedia: multerFile.array(),
});

export type updateTeamMediaType = typeof updateTeamMediaValidator.infer;


export const deleteTeamMediaValidator = type({
  teamMediaId: 'string',
})

export type deleteTeamMediaType = typeof deleteTeamMediaValidator.infer



export const getTeamMediaValidator = type({
  page: 'number',
  pageSize: 'number',
  teamId: 'string',
});

export type getTeamMediaType = typeof getTeamMediaValidator.infer;

export const updateTeamValidator = type({
  userId: 'string',
  teamId: 'string',
  teamName: 'string',
  ourStory: 'string',
  teamGoals: 'string[]',
  achievement: 'string',
  "profileImage?": multerFile.array(),
  "coverImage?": multerFile.array()
})

export type updateTeamType = typeof updateTeamValidator.infer