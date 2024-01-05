const express = require("express");
const router = express.Router();
const Note = require("../models/notes");
const {
  authenticateUser,
  notesRateLimit,
} = require("../middlewares/middlewares");

// Search route
router.get("/", authenticateUser, notesRateLimit, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.userId;

    //regex pattern to perform case-insensitive search on title and content
    const searchRegex = new RegExp(q, "i");

    const notes = await Note.find({
      owner: userId,
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
      ],
    });

    res.status(200).json({ notes: notes });
  } catch (error) {
    res.status(500).json({ message: "Error searching notes", error: error });
  }
});

module.exports = router;
