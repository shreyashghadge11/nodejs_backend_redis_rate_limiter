const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../config/index");

describe("Authentication Routes", () => {
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
    await User.deleteMany({});
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ email: "testuser@example.com", password: "testpassword" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User Created");
      expect(response.body.email).toBe("testuser@example.com");

      // Check if the user is stored in the database
      const user = await User.findOne({ email: "testuser@example.com" });
      expect(user).toBeTruthy();
      expect(user.email).toBe("testuser@example.com");
      expect(await bcrypt.compare("testpassword", user.password)).toBe(true);
    });

    it("should return an error for duplicate email", async () => {
      // Create a user with the same email
      await User.create({
        email: "testuser@example.com",
        password: "testpassword",
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send({ email: "testuser@example.com", password: "testpassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email already exists");
    });

    it("should return an error for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ email: "invalid-email", password: "testpassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Email");
    });

    it("should return an error for invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ email: "testuser@example.com", password: "short" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Password must be at least 8 characters long"
      );
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      const hashedPassword = await bcrypt.hash("testpassword", 10);
      await User.create({
        email: "testuser@example.com",
        password: hashedPassword,
      });
    });

    it("should log in a user with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "testuser@example.com", password: "testpassword" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login Successful");
      expect(response.body.token).toBeTruthy();
      const decodedToken = jwt.verify(response.body.token, TOKEN_SECRET);
      expect(decodedToken).toHaveProperty("userId");
      expect(decodedToken.email).toBe("testuser@example.com");
    });

    it("should return an error for non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "testpassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email does not exist");
    });

    it("should return an error for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "invalid-email", password: "testpassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Email");
    });

    it("should return an error for incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "testuser@example.com", password: "incorrectpassword" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Password");
    });
  });
});
