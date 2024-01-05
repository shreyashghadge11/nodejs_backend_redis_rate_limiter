const express = require("express");
const router = express.Router();
const Note = require("../models/notes"); // Import Note model
const User = require("../models/user"); // Import User model
const {
  authenticateUser,
  notesRateLimit,
} = require("../middlewares/middlewares"); // Import middlewares

// GET /api/notes
router.get("/", authenticateUser, notesRateLimit, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.userId });
    res.status(200).json({ notes: notes });
  } catch (error) {
    res.status(500).json({ message: "Error getting notes", error: error });
  }
});

// GET /api/notes/:id
router.get("/:id", authenticateUser, notesRateLimit, async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await Note.findOne({ _id: noteId, owner: req.userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Error getting note", error: error });
  }
});

// POST /api/notes
router.post("/", authenticateUser, notesRateLimit, async (req, res) => {
  const { title, content } = req.body;

  try {
    const newNote = new Note({ title, content, owner: req.userId });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: "Error Creating Note", error: error });
  }
});

// PUT /api/notes/:id
router.put("/:id", authenticateUser, notesRateLimit, async (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, owner: req.userId },
      { $set: { title, content, updatedAt: new Date() } },
      { new: true }
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ message: "Note not found or not owned by the user" });
    }

    res
      .status(200)
      .json({ message: "Note updated successfully", note: updatedNote });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error });
  }
});

// DELETE /api/notes/:id
router.delete("/:id", authenticateUser, notesRateLimit, async (req, res) => {
  const noteId = req.params.id;

  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      owner: req.userId,
    });

    if (!deletedNote) {
      return res
        .status(404)
        .json({ message: "Note not found or not owned by the user" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error });
  }
});

// POST /api/notes/:id/share
router.post(
  "/:id/share",
  authenticateUser,
  notesRateLimit,
  async (req, res) => {
    const noteId = req.params.id;
    const { sharedUserEmail } = req.body;

    try {
      const note = await Note.findOne({ _id: noteId, owner: req.userId });

      if (!note) {
        return res
          .status(404)
          .json({ message: "Note not found or not owned by the user" });
      }

      const userToShare = await User.findOne({ email: sharedUserEmail });

      if (!userToShare) {
        return res
          .status(404)
          .json({ message: "User to be shared with Not Found" });
      }
      const sharedUserId = userToShare._id;

      if (note.sharedWith.includes(sharedUserId)) {
        return res
          .status(400)
          .json({ message: "Note already shared with this user" });
      }

      note.sharedWith.push(sharedUserId);
      await note.save();

      res.status(200).json({ message: "Note shared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error sharing note", error: error });
    }
  }
);

module.exports = router;
