import { HotelType, HotelWithRoomsType, RoomType } from "@/protocols";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotelsResponse(): Promise<HotelType[]> {
  const response = await hotelRepository.findHotels();
  return response;
}

async function getHotelByIdResponse(hotelId: number) {
  const response = await hotelRepository.findRoom(hotelId);
  return response;
}

const hotelsService = {
  getHotelsResponse,
  getHotelByIdResponse,
};

export default hotelsService;
