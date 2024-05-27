import { Request, Response } from "../types/RequestWithuser";

const notFound = (req: Request, res: Response) => {
  return res.status(404).json({ success: false, msg: "Route not found" });
};

export default notFound;
