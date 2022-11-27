import { prisma } from "@/config";

async function findHotels() {
  return await prisma.hotel.findMany({});
}

async function findRoom(hotelId: number) {
  return await prisma.room.findMany({
    where: {
      hotelId: hotelId,
    },
    include: {
      Hotel: true,
    },
  });
}

const hotelRepository = {
  findHotels,
  findRoom,
};

export default hotelRepository;
