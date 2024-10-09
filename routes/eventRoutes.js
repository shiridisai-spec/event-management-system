const express = require("express");
const {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  manageRegistration,
  getAllUsersAndTheirEvents,
  getUserEvents,
  managerMultipleRegistrations,
} = require("../controllers/eventControllers");

const authenticateUserRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/createevent", authenticateUserRole("admin"), createEvent);
router.get("/allevents", getAllEvents);
router.get("/getevent/:id", getSingleEvent);
router.patch("/updateevent/:id", authenticateUserRole("admin"), updateEvent);
router.delete("/deleteevent", authenticateUserRole("admin"), deleteEvent);
router.post("/manage-registration", manageRegistration);
router.get(
  "/getallusersandtheirevents",
  authenticateUserRole("admin"),
  getAllUsersAndTheirEvents
);
router.get("/getuserevents", getUserEvents);
router.post("/manage-multiple-registrations", managerMultipleRegistrations);

module.exports = router;
