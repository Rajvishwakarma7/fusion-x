import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';

export const createTeam = async () => {
  try {
    return GenResObj(Code.OK, true, 'Team created successfully');
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};
