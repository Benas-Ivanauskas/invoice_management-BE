import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltOrRounds);
};

export const compare = async (password: string, userPassword: string) => {
  return await bcrypt.compare(userPassword, password);
};
