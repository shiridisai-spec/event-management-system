const { StatusCodes } = require("http-status-codes");
const { pool } = require("../db/connect");
const CustomAPIError = require("../errors/custom-api");

const notificationQueries = require("../queries/notificationQueries");

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(notificationQueries.getUserNotifications, [
      userId,
    ]);
    res.status(StatusCodes.OK).json({
      notifications: result.rows,
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

const markNotificationAsRead = async (req, res) => {
  const { notificationIds } = req.body;
  try {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid notification IDs" });
    }

    // Mark notifications as read
    await pool.query(notificationQueries.markNotificationsAsRead, [
      notificationIds,
    ]);

    // Delete the notifications
    await pool.query(notificationQueries.deleteReadNotifications, [
      notificationIds,
    ]);

    res.status(StatusCodes.OK).json({
      message: "Notifications marked as read and deleted",
    });
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

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
};
