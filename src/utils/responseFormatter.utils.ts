export const GenResObj = (
  code: number,
  status: boolean,
  message: string,
  data?: any
) => {
  return {
    code,
    data: {
      status,
      message,
      data: data || null,
    },
  };
};
