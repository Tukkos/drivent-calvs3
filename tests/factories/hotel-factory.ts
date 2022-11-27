import { prisma } from "@/config";
import { HotelType } from "@/protocols";
import faker from "@faker-js/faker";

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createHotelRooms(hotelId: number) {
  return await prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: Number(faker.random.numeric()),
      hotelId: hotelId,
    },
  });
}
