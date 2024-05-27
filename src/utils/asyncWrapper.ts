import { NextFunction, Request, Response } from "../types/RequestWithuser";

const asyncWrapper =
  (fn: (...args: any[]) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
export default asyncWrapper;
