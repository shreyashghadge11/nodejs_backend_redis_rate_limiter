const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Note = require("../models/notes");
const User = require("../models/user");

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
  await Note.deleteMany({});
  await User.deleteMany({});
});

describe("Notes Routes", () => {
  let authToken; // Store the authentication token for future requests
  let userId;
  beforeEach(async () => {
    // Create a user and get an authentication token
    const responseSignup = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com", password: "testpassword" });

    // Get the authentication token
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "testpassword" });

    authToken = response.body.token;
    const User_ = await User.findOne({ email: "test@example.com" });
    userId = User_._id;
  });

  describe("GET /api/notes", () => {
    it("should get all notes for the authenticated user", async () => {
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
        .get("/api/notes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notes.length).toBe(2);
    });
  });

  describe("POST /api/notes", () => {
    it("should create a new note for the authenticated user", async () => {
      // Make the POST request with the authentication token
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test Note", content: "Test content" });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Test Note");
      expect(response.body.content).toBe("Test content");
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should update a note for the authenticated user", async () => {
      // Create a note for the authenticated user
      const note = new Note({
        title: "Test Note",
        content: "Test content",
        owner: userId,
      });
      await note.save();

      // Make the PUT request with the authentication token
      const response = await request(app)
        .put(`/api/notes/${note._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Note", content: "Updated content" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Note updated successfully");
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note for the authenticated user", async () => {
      // Create a note for the authenticated user
      const note = new Note({
        title: "Test Note",
        content: "Test content",
        owner: userId,
      });
      await note.save();

      // Make the DELETE request with the authentication token
      const response = await request(app)
        .delete(`/api/notes/${note._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Note deleted successfully");
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should get a specific note for the authenticated user", async () => {
      // Create a note for the authenticated user
      const note = new Note({
        title: "Test Note",
        content: "Test content",
        owner: userId,
      });
      await note.save();

      // Make the GET request with the authentication token
      const response = await request(app)
        .get(`/api/notes/${note._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Test Note");
      expect(response.body.content).toBe("Test content");
    });
  });

  describe("POST /api/notes/:id/share", () => {
    it("should share a note with another user for the authenticated user", async () => {
      // Create a note for the authenticated user
      const note = new Note({
        title: "Test Note",
        content: "Test content",
        owner: userId,
      });
      await note.save();

      // Create another user to share the note with
      const anotherUser = new User({
        email: "another@example.com",
        password: "anotherpassword",
      });
      await anotherUser.save();

      // Make the POST request with the authentication token
      const response = await request(app)
        .post(`/api/notes/${note._id}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ sharedUserEmail: "another@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Note shared successfully");
    });
  });
});
