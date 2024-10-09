const { StatusCodes } = require("http-status-codes");
const { pool } = require("../db/connect");
const BadRequestError = require("../errors/bad-request");
const notFoundError = require("../errors/not-found");
const queries = require("../queries/eventQueries");
const notificationQueries = require("../queries/notificationQueries");
const CustomAPIError = require("../errors/custom-api");

const createEvent = async (req, res) => {
  const { title, description, category, location } = req.body;
  const createdById = req.user.id;

  //Basic validation
  if (!title || !description || !category || !location) {
    throw new BadRequestError("All fields are required");
  }

  try {
    const existingEvent = await pool.query(queries.getEventByTitle, [title]);
    if (existingEvent.rows.length > 0) {
      throw new BadRequestError("Event with this title already exists");
    }
    const newEvent = await pool.query(queries.createEvent, [
      title,
      description,
      category,
      location,
      createdById,
    ]);

    res.status(StatusCodes.CREATED).json({
      message: "Event created successfully",
      event: newEvent.rows[0],
    });
  } catch (error) {
    console.log("Error creating event:", error);

    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const getAllEvents = async (req, res) => {
  try {
    const allEvents = await pool.query(queries.getAllEvents);
    res.status(StatusCodes.OK).json({
      success: true,
      length: allEvents.rows.length,
      events: allEvents.rows,
    });
  } catch (error) {
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const getEvent = await pool.query(queries.getSingleEvent, [id]);
    console.log("getEvent====>", getEvent);
    if (getEvent.rows.length > 0) {
      res.status(StatusCodes.OK).json({
        message: "Success",
        event: getEvent.rows[0],
      });
    } else {
      throw new notFoundError("Event not found!");
    }
  } catch (error) {
    console.log("error", error);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const getAllUsersAndTheirEvents = async (req, res) => {
  try {
    const allUsersAndTheriEvents = await pool.query(
      queries.getAllUsersAndTheirEvents
    );
    res.status(StatusCodes.OK).json({
      status: "success",
      code: StatusCodes.OK,
      length: allUsersAndTheriEvents?.rows?.length,
      userEvents: allUsersAndTheriEvents?.rows,
    });
  } catch (error) {
    console.log("Error getting users and their events", error);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const getUserEvents = async (req, res) => {
  const userId = req.user.id;
  try {
    const userEvents = await pool.query(queries.getUserEvents, [userId]);
    if (userEvents?.rows?.length > 0) {
      res.status(StatusCodes.OK).json({
        status: "success",
        code: StatusCodes.OK,
        userEvents: userEvents?.rows,
      });
    } else {
      throw new notFoundError("Event not found!");
    }
  } catch (error) {
    console.log("Error getting users and their events", error);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const createdById = req.user.id;
  const { title, description, category, location } = req.body;

  //Basic validation
  if (!title || !description || !category || !location) {
    throw new BadRequestError("All fields are required");
  }

  try {
    const existingEvent = await pool.query(queries.getEventByTitle, [title]);
    if (existingEvent.rows.length > 0) {
      throw new BadRequestError("Event with this title already exists");
    }

    const updatedEvent = await pool.query(queries.updateEvent, [
      title,
      description,
      category,
      location,
      createdById,
      id,
    ]);

    if (updatedEvent.rows.length > 0) {
      res.status(StatusCodes.OK).json({
        message: "Event updated successfully",
        updatedEvent: updatedEvent.rows[0],
      });
    } else {
      throw new notFoundError("Event cannot be updated!");
    }
  } catch (error) {
    console.log("error", error);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const deleteEvent = async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError("Please provide valid event IDs");
  }
  try {
    // Step 1: Fetch users registered for the events
    const usersResult = await pool.query(queries.distinctUserEvents, [ids]);
    const userIds = usersResult?.rows?.map((row) => row.user_id);

    // Step 2: Fetch the event names for the deleted events
    const eventsResult = await pool.query(queries.fetchDeletedEventNames, [
      ids,
    ]);
    const eventNames = eventsResult?.rows?.reduce((acc, event) => {
      acc[event.id] = event.title; //Store event title with its Id
      return acc;
    }, {});

    // Step 3: Notify users about the deleted events
    for (const user_id of userIds) {
      const deletedEventsNames = ids
        .map((id) => eventNames[id])
        .filter((name) => name)
        .join(", ");
      await pool.query(notificationQueries.createNotification, [
        user_id,
        null,
        `The Following events you registered for have been deleted: ${deletedEventsNames}`,
      ]);
    }

    // Step 4: Delete the events
    const deletedEvent = await pool.query(queries.deleteEvent, [ids]);
    if (deletedEvent.rowCount > 0) {
      res.status(StatusCodes.ACCEPTED).json({
        message: "Events deleted successfully",
      });
    } else {
      throw new notFoundError("Events not found!");
    }
  } catch (error) {
    console.log("Error deleting events:", error);

    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const manageRegistration = async (req, res) => {
  const { events } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!Array.isArray(events) || events.length === 0) {
    throw new BadRequestError("Events are requied");
  }

  try {
    // Step 1: Get current registrations
    const currentRegistrations = await pool.query(
      queries.getCurrentRegistrations,
      [userId]
    );
    const registeredEventsIds = currentRegistrations?.rows?.map(
      (row) => row.event_id
    );

    // Step 2: Determine events to deregister from
    const eventsToDeregister = registeredEventsIds?.filter(
      (id) => !events.includes(id)
    );

    // Step 3: Deregister the user from events no longer in the array
    if (eventsToDeregister.length > 0) {
      await pool.query(queries.deregisterEvents, [userId, eventsToDeregister]);
    }

    // Step 4: Determine events to register for
    const eventsToRegister = events.filter(
      (id) => !registeredEventsIds.includes(id)
    );

    // Step 5: Register for new events
    if (eventsToRegister.length > 0) {
      await pool.query(queries.registerEvents, [userId, eventsToRegister]);
    }

    res.status(200).json({
      message: "Registration updated successfully.",
      userId: userId,
      registeredEvents: [
        ...eventsToRegister,
        ...registeredEventsIds.filter((id) => events.includes(id)),
      ],
    });
  } catch (error) {
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const managerMultipleRegistrations = async (req, res) => {
  const { registrations } = req.body;

  // Basic validations
  if (
    !registrations ||
    !Array.isArray(registrations) ||
    registrations.length === 0
  ) {
    throw new BadRequestError("Registrations are required");
  }

  try {
    for (let registration of registrations) {
      const { user_id, events } = registration;

      // Query the database to get current user's event registrations
      const registeredEventsResult = await pool.query(
        queries.getCurrentRegistrations,
        [user_id]
      );

      // Get all the registered event ids
      const registeredEventsIds = (registeredEventsResult?.rows || []).map(
        (row) => row.event_id
      );

      // Events to register
      const eventsToRegister = (events || []).filter(
        (event_id) => !registeredEventsIds.includes(event_id)
      );

      // Events to deregister
      const eventsToDeregister = (registeredEventsIds || []).filter(
        (event_id) => !events.includes(event_id)
      );

      // Insert new registrations
      if (eventsToRegister.length > 0) {
        const values = eventsToRegister
          .map((event_id) => `(${user_id}, ${event_id})`)
          .join(",");
        await pool.query(
          `INSERT INTO registrations (user_id, event_id) VALUES ${values}`
        );
      }

      // Remove deregistered events
      if (eventsToDeregister.length > 0) {
        await pool.query(queries.deregisterEvents, [
          user_id,
          eventsToDeregister,
        ]);
      }

      // Prepare promises for notifications
      const notificationPromises = [];

      // Create notifications for newly registered events
      for (const event_id of eventsToRegister) {
        const eventDetails = await pool.query(queries.getSingleEvent, [
          event_id,
        ]);
        // Check if eventDetails.rows is not empty
        if (eventDetails?.rows?.length > 0) {
          const eventName = eventDetails?.rows[0]?.title; // Get event title
          notificationPromises.push(
            pool.query(notificationQueries.createNotification, [
              user_id,
              event_id,
              `You have been registered for ${eventName}.`,
            ])
          );
        }
      }

      // Create notifications for deregistered events
      for (const event_id of eventsToDeregister) {
        const eventDetails = await pool.query(queries.getSingleEvent, [
          event_id,
        ]);
        // Check if eventDetails.rows is not empty
        if (eventDetails.rows.length > 0) {
          const eventName = eventDetails.rows[0].title; // Get event title
          notificationPromises.push(
            pool.query(notificationQueries.createNotification, [
              user_id,
              event_id,
              `You have been unregistered from ${eventName}.`,
            ])
          );
        }
      }

      // If there were both registrations and deregistrations, create a summary notification
      if (eventsToRegister.length > 0 && eventsToDeregister.length > 0) {
        const registeredNames = await Promise.all(
          eventsToRegister.map(async (event_id) => {
            const eventDetails = await pool.query(queries.getSingleEvent, [
              event_id,
            ]);
            return eventDetails.rows[0].title;
          })
        );

        const deregisteredNames = await Promise.all(
          eventsToDeregister.map(async (event_id) => {
            const eventDetails = await pool.query(queries.getSingleEvent, [
              event_id,
            ]);
            return eventDetails.rows[0].title;
          })
        );

        const summaryMessage = `You have been registered for: ${registeredNames.join(
          ", "
        )} and unregistered from: ${deregisteredNames.join(", ")}.`;

        notificationPromises.push(
          pool.query(notificationQueries.createNotification, [
            user_id,
            null,
            summaryMessage,
          ])
        );
      }

      // Execute all notifications simultaneously
      await Promise.all(notificationPromises);
    }

    res.status(StatusCodes.OK).json({
      message: "Registration/deregistration successful",
    });
  } catch (error) {
    console.error("Error:", error.message, error.stack);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  getAllUsersAndTheirEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  manageRegistration,
  managerMultipleRegistrations,
};
