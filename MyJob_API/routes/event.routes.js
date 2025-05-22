const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

// Route to create a new event
router.post("/create", createEvent);

// Route to get all events (with optional filters)
router.get("/getall", getAllEvents);

// Route to get a single event by ID
router.get("/get/:Id", getEventById);

// Route to update an event by ID
router.put("/update/:Id", updateEvent);

// Route to delete an event by ID
router.delete("/delete/:Id", deleteEvent);

module.exports = router;
