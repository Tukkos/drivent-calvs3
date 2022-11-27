import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import ticketService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const ticket = await ticketService.getTicketByUserId(userId);

    if (ticket.status === "RESERVED") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
        
    if (ticket.TicketType.includesHotel === false) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    const hotels = await hotelsService.getHotelsResponse();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.params.id);
  try {
    if (!hotelId || isNaN(hotelId)) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const hotelRoom = await hotelsService.getHotelByIdResponse(hotelId);

    if (hotelRoom.length === 0) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.status(httpStatus.OK).send(hotelRoom);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
