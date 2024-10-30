const generateId = (): string => {
  return crypto.randomUUID();
};

export { generateId };
