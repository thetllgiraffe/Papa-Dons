# Papa-Dons
A website application dedicated to allowing users to book the calendar of Papa Dons in real time and track its location as well as discover some things about the owners.

## I have maintained the file structure of the main branch and placed in in the public folder where all static files are served so that code will not break due to file structure changes

This is a calender app with a node server and sqlite3. It is very basic atm but a good starting template that can be customized for particular uses.

If you have node already installed then just run `npm -i` Then `node app.js` to run the application

Events can be scheduled but will not show up on the calender until an admin approved the event

The Calender UI for users wanting to schedule an event can be found at http://localhost:3000

The Admin side for an owner wanting to approve or deny an event can be found at http://localhost:3000/admin The username and password is for now set at: username: admin password: secret

If you want to have a clear picture of what is going on, have both routes in seperate tabs and hit refresh to see updates when events are submitted and approved

If you want to test out the automatic email function for emails sent to the admin and users just add your email to the second line in the .env file
(Just be aware, the .env file is currently being tracked, I dont mind my mailer_password being pulblic for now)

My email is currently the one sending out automatic replies but a noreply email can be set up for the admin in production, as well as a create account and password retrieval logic.

### if switching back over to another branch, run `git clean -fd` to clear untracked node_modules and data.db
