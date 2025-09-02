import "express";

declare module "express" {
  export interface Request {
    user?: {
      tenantId: string;
      // add other properties if needed
    };
  }
}