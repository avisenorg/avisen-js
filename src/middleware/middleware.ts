import express, { Request, Response, Express, NextFunction} from "express";
import cors from 'cors';
import {header, validationResult} from "express-validator";

export const validateNetworkIdHeader = [
  header("X-Network-ID")
    .exists()
    .withMessage("Required X-Network-ID is missing")
    .equals(process.env.NETWORK_ID as string)
    .withMessage("Network ID does not match expected network id"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }
];

export function middleware(app: Express) {
  app.use(express.json());

  app.use(cors());
}
