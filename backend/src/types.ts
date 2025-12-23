export type AuthUser = {
  userId: string;
  hospitalId: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

