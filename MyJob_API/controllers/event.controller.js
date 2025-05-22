const Event = require("../models/event.model");
const Organization = require("../models/organization.details.model");
const { Sequelize, Op } = require("sequelize"); // Import Sequelize and Op

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      compId,
      degName,
      strength,
      startingDate,
      endingDate,
      eventDescription,
      requirements,
      jobType,
      workPlaceType,
    } = req.body;

    const newEvent = await Event.create({
      compId,
      degName,
      strength,
      startingDate,
      endingDate,
      eventDescription,
      requirements,
      jobType,
      workPlaceType,
      status: 1, // Active by default
    });

    res.status(201).json({ message: "Event created successfully", data: newEvent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { degName, ...rest } = req.query; // Extract query parameters

    // Build the where clause dynamically
    const whereClause = {};

    if (degName) {
      whereClause.degName = { [Op.like]: `%${degName}%` }; // Case-insensitive match for designation name
    }

    // Fetch events with filters applied
    const eventsWithCompanyDetails = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: Organization,
          as: "organization",
          attributes: [
            "organizationName",
            "logo",
            "address",
            "email",
            "phoneNo",
            "website",
            "description",
            "industry",
            "specialization",
            "since",
            "socialMediaLink",
            "compId",
          ],
        },
      ],
    });

    if (!eventsWithCompanyDetails || eventsWithCompanyDetails.length === 0) {
      return res.status(404).json({ message: "No events found" });
    }

    res.status(200).json({
      message: "Events and Company details retrieved successfully",
      data: eventsWithCompanyDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving events", error: error.message });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
    try {
      const { Id } = req.params; // Extract eventId from route parameters
  
      // Fetch the event with associated organization details
      const eventWithCompanyDetails = await Event.findOne({
        where: { eventId : Id }, // Filter by eventId
        include: [
          {
            model: Organization,
            as: "organization",
            attributes: [
              "organizationName",
              "logo",
              "address",
              "email",
              "phoneNo",
              "website",
              "description",
              "industry",
              "specialization",
              "since",
              "socialMediaLink",
              "compId",
            ],
          },
        ],
      });
  
      if (!eventWithCompanyDetails) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      res.status(200).json({
        message: "Event and Organization details retrieved successfully",
        data: eventWithCompanyDetails,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving event", error: error.message });
    }
  };
  
  
  
  

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { Id } = req.params;
    const updates = req.body;

    const event = await Event.findOne({ where: { eventId : Id } });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.update(updates);

    res.status(200).json({ success: true, message: "Event updated successfully", data: event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};


// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { Id } = req.params;
    const event = await Event.findOne({ where: { Id } });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.destroy();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
