const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Note = require("../models/notes");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

describe("Search Routes", () => {
  let authToken; // Store the authentication token for future requests
  let userId;
  beforeAll(async () => {
    await mongoose.connection.close();
    await mongoose.connect("mongodb://localhost:27017/test-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a user and get an authentication token
    await User.deleteMany({});
    await Note.deleteMany({});

    const responseSignup = await request(app)
      .post("/api/auth/signup")
      .send({ email: "testuser@example.com", password: "testpassword" });

    console.log(responseSignup.body);
    // Get the authentication token
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "testpassword" });

    authToken = response.body.token;
    console.log(response.body);
    const User_ = await User.findOne({ email: "testuser@example.com" });
    userId = User_._id;
  });

  describe("GET /api/search?q=:query:", () => {
    it("should search notes by query for the authenticated user", async () => {
      // Create multiple notes for the authenticated user

      await Note.create({
        title: "Test Note 1",
        content: "Test content 1",
        owner: userId,
      });
      await Note.create({
        title: "Test Note 2",
        content: "Test content 2",
        owner: userId,
      });

      // Make the GET request with the authentication token
      const response = await request(app)
        .get("/api/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ q: "Test Note" });

      // console.log(response);
      expect(response.status).toBe(200);
      console.log(response.body);
      expect(response.body.notes.length).toBe(2);
      expect(response.body.notes[0].title).toBe("Test Note 1");
      expect(response.body.notes[0].content).toBe("Test content 1");
      expect(response.body.notes[1].title).toBe("Test Note 2");
      expect(response.body.notes[1].content).toBe("Test content 2");
    });
  });
});
