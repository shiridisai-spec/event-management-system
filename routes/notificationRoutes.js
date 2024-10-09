const express = require("express");

const {
  markNotificationAsRead,
  getUserNotifications,
} = require("../controllers/notificationControllers");

const router = express.Router();

router.post("/mark-notification-as-read", markNotificationAsRead);
router.get("/getnotifications", getUserNotifications);

module.exports = router;
