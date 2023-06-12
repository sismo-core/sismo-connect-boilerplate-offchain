export const formatError = (error: Error | null) => {
  if(!error) return "";
  return error?.message?.split("args:")?.[0]?.split("data:")?.[0]?.trim() || "";
};
