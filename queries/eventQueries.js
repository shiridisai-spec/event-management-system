module.exports = {
  createEvent:
    "INSERT INTO events (title, description, category, location, created_by_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
  getAllEvents:
    "select count(r.user_id) as no_of_users_registered, e.id, e.title, e.description, e.category, e.location from events e inner join registrations r on e.id = r.event_id group by e.id, e.title, e.description, e.category, e.location order by e.id asc",
  getSingleEvent:
    "select e.id as event_id, e.title, e.description, e.category, e.location, e.created_by_id, u.name as created_by_name, e.created_at, e.updated_at from events e join users u on u.id = e.created_by_id where e.id = $1",
  updateEvent:
    "UPDATE events SET title = $1, description = $2, category = $3, location = $4, created_by_id = $5 WHERE id = $6 RETURNING *",
  deleteEvent: "DELETE FROM events WHERE id = ANY($1)",
  getEventByTitle: "SELECT * FROM events WHERE title = $1",
  getCurrentRegistrations:
    "SELECT event_id FROM registrations WHERE user_id = $1",
  registerEvents:
    "INSERT INTO registrations (user_id, event_id) VALUES ($1, UNNEST($2::int[]))",
  deregisterEvents:
    "DELETE FROM registrations WHERE user_id = $1 AND event_id = ANY($2::int[])",
  getAllUsersAndTheirEvents:
    "SELECT r.user_id, u.name, u.email, JSON_AGG(JSON_BUILD_OBJECT('event_id', r.event_id, 'title', e.title, 'description', e.description, 'category', e.category, 'location', e.location, 'registered_at', r.registered_at)) as events FROM registrations r INNER JOIN users u ON r.user_id = u.id INNER JOIN events e ON r.event_id = e.id GROUP BY r.user_id, u.name, u.email ORDER BY r.user_id ASC;",
  getUserEvents:
    "SELECT r.user_id, u.name, JSON_AGG( JSON_BUILD_OBJECT('event_id', r.event_id, 'title', e.title, 'description', e.description, 'category', e.category, 'location', e.location, 'registered_at', r.registered_at )) as events from registrations r inner join users u on r.user_id = u.id inner join events e on r.event_id = e.id where r.user_id = $1 group by r.user_id, u.name;",
  distinctUserEvents: `
    SELECT DISTINCT user_id 
    FROM registrations 
    WHERE event_id = ANY($1::int[])
  `,
  fetchDeletedEventNames: `
      SELECT id, title 
      FROM events 
      WHERE id = ANY($1::int[])
    `,
};
