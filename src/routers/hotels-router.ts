import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotelById, getHotels } from "@/controllers/hotels-controller";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("", getHotels)
  .get("/:id", getHotelById);

export { hotelsRouter };
