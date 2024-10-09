module.exports = {
  createNotification:
    "INSERT INTO notifications (user_id, event_id, message) VALUES ($1, $2, $3)",

  getUserNotifications: `
        SELECT * 
        FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `,

  markNotificationsAsRead: `
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE id = ANY($1::int[])
  `,

  deleteReadNotifications: `
    DELETE FROM notifications 
    WHERE id = ANY($1::int[]) 
      AND is_read = TRUE
  `,
};
