import app, { init } from "@/app";
import { createEnrollmentWithAddress, createTicket, createTicketType, createTicketTypeWithHotel, createTicketTypeWithoutHotel, createUser } from "../factories";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { createHotel, createHotelRooms } from "../factories/hotel-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);
let hotelId = 0;

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    // it("should respond with status 404 if there is no ticket", async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);

    //     const response = await server.get("/tickets").set("Authorization", `Bearer ${token}`);

    //     expect(response.status).toEqual(httpStatus.NOT_FOUND);
    // });

    it("should respond with status 402 if the ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 401 if the ticket type dont includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 200 and with hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      ]));
      hotelId = response.body[0].id;
    });
  });
});

describe("GET /hotels/:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get(`/hotels/${hotelId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if the hotel id is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const word = faker.word.adjective();

      const response = await server.get(`/hotels/${word}`).set("Authorization", `Bearer ${token}`);
            
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    // it("should respond with status 400 if the hotel id is empty", async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);

    //     const empty = "";

    //     const response = await server.get(`/hotels/${empty}`).set("Authorization", `Bearer ${token}`);
            
    //     expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    // });

    it("should respond with status 404 if the hotel dont exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      hotelId = faker.datatype.number();

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
        
    it("should respond with status 200 and with existing Hotel rooms data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createHotelRooms(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([{
        id: expect.any(Number),
        capacity: expect.any(Number),
        name: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        hotelId: expect.any(Number),
        Hotel: {
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      }]);
    });
  });
});
