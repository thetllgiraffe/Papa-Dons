import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3/build/es6/luxon.min.js';

const eventForm = document.getElementById('eventForm');
const pendingtable = document.getElementById('pending-body');
const approvedtable = document.getElementById('approved-body');
const eventModal = document.getElementById('eventModal');
const cancelBtn = document.getElementById('cancelBtn');
const closeModal = document.getElementById('closeModal');
const closeViewModal = document.getElementById('closeViewModal');
const viewEventModal = document.getElementById('viewEventModal');

// get tab buttons and containers for nav bar function
const eventsBtn = document.getElementById('eventsBtn');
const scheduleBtn = document.getElementById('scheduleBtn');
const eventsContainer = document.querySelector('.events-container')
const scheduleContainer = document.querySelector('.schedule-container')
const logOutBtn = document.getElementById('logOut');

// add event listeners to show and hide events interface and schedule interface
logOutBtn.addEventListener('click', () => {
  fetch('/panel/signout', { method: 'POST' })
  .then(() => {
    window.location.href = '/admin';
  })
});

eventsBtn.addEventListener('click', (e) => {
  e.target.closest('div').classList.add('selected-tab');
  scheduleBtn.closest('div').classList.remove('selected-tab');
  eventsContainer.classList.remove('hidden');
  scheduleContainer.classList.add('hidden');
})
scheduleBtn.addEventListener('click', (e) => {
  e.target.closest('div').classList.add('selected-tab');
  eventsBtn.closest('div').classList.remove('selected-tab');
  scheduleContainer.classList.remove('hidden');
  eventsContainer.classList.add('hidden');
})

closeModal.addEventListener('click', () => {
  eventModal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  		eventModal.style.display = 'none';
  });



eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  eventModal.style.display = 'none';

  fetch('/panel/events/edit', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: document.getElementById('eventId').value,
      title: document.getElementById('eventTitle').value,
      date: document.getElementById('eventDate').value,
      starttime: document.getElementById('startTime').value,
      endtime: document.getElementById('endTime').value,
      location: document.getElementById('eventLocation').value,
      description: document.getElementById('eventDescription').value,
      type: document.querySelector('input[name="eventType"]:checked').value, 
      email: document.getElementById('eventEmail').value,
     }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  }
  ).then(data => {
    console.log(data);
    fetchlist();
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
})

const approvedenyEvent = (e) => {
  e.stopPropagation();
  fetch('/panel/events', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: e.target.dataset.id, action: e.target.dataset.action, email: e.target.dataset.email}),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  }
  ).then(data => {
    console.log(data);
    fetchlist();
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}


const removeEvent = (e) => {
  e.stopPropagation();
  fetch('/panel/events', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: e.target.dataset.id, email: e.target.dataset.email}),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  }
  ).then(data => {
    console.log(data);
    fetchlist();
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
})}



const openEditEventModal = (e) => {
  e.stopPropagation();
  const row = e.target.closest('tr')
  document.querySelector('input[value="public"').checked = false;
  document.querySelector('input[value="private"]').checked = false;
  document.getElementById('eventId').value = row.dataset.id;
  document.getElementById('eventTitle').value = row.dataset.title;
  document.getElementById('eventDate').value = row.dataset.date;
  document.getElementById('startTime').value = row.dataset.starttime;
  document.getElementById('endTime').value = row.dataset.endtime;
  document.getElementById('eventLocation').value = row.dataset.location;
  document.getElementById('eventDescription').value = row.dataset.description;
  document.getElementById('eventEmail').value = row.dataset.email;
  const eventTypeValue = row.dataset.type;
  document.querySelector(`input[value=${eventTypeValue}]`).checked = true;
  
  eventModal.style.display = 'block';
}

closeViewModal.addEventListener('click', () => {
    viewEventModal.style.display = 'none';
});

const openViewEventModal = (e) => {
		document.getElementById('viewEventTitle').textContent = e.currentTarget.dataset.title;
		document.getElementById('viewEventDate').textContent = formatToMonDayYear(e.currentTarget.dataset.date);
    document.getElementById('viewEventStartTime').textContent = convertTo12Hour(e.currentTarget.dataset.starttime);
    document.getElementById('viewEventEndTime').textContent = convertTo12Hour(e.currentTarget.dataset.endtime);
    document.getElementById('viewEventLocation').textContent = e.currentTarget.dataset.location;
    document.getElementById('viewEventDescription').textContent = e.currentTarget.dataset.description;
    document.getElementById('viewEventEmail').textContent = e.currentTarget.dataset.email;
    document.getElementById('viewEventType').textContent = e.currentTarget.dataset.type;
		viewEventModal.style.display = 'block';
}

  
const fetchlist = () => {fetch('/panel/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}).then(data => {
  pendingtable.innerHTML = ''; // Clear existing rows
  approvedtable.innerHTML = ''; // Clear existing rows
  // Loop through the data and create table rows
  data.forEach(event => {
    // Check if the event is pending and the date is today or in the future
    const eventDate = DateTime.fromISO(event.date, { zone: 'America/Chicago' });
    const now = DateTime.now().setZone('America/Chicago');
    const row = document.createElement('tr');
    row.dataset.id = event.id;
    row.dataset.title = event.title;
    row.dataset.date = eventDate.toISODate();
    row.dataset.starttime = event.starttime;
    row.dataset.endtime = event.endtime;
    row.dataset.location = event.location;
    row.dataset.description = event.description;
    row.dataset.type = event.type;
    row.dataset.email = event.email;
    row.addEventListener('click', openViewEventModal);

    if (event.status === 'pending' && eventDate >= now) {
      row.innerHTML = `
        <td>${event.title}</td>
        <td>${formatToMonDayYear(eventDate)}</td>
        <td>${convertTo12Hour(event.starttime)}</td>
        <td>${convertTo12Hour(event.endtime)}</td>
        <td>${event.location}</td>
        `;
      // <td>${event.description}</td>
      // <td>${event.email}</td>
      // <td>${event.type}</td>
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.dataset.id = event.id;
      approveBtn.dataset.email = event.email;
      approveBtn.dataset.action = 'approve';
      approveBtn.addEventListener('click', approvedenyEvent);

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.dataset.id = event.id;
      rejectBtn.dataset.email = event.email;
      rejectBtn.dataset.action = 'reject';
      rejectBtn.addEventListener('click', approvedenyEvent);

      const td = document.createElement('td');
      td.appendChild(approveBtn);
      td.appendChild(rejectBtn);
      row.appendChild(td);
      // Append the row to the pending table
      pendingtable.appendChild(row);
    // check if the event is approved and the date is today or in the future
    } else if (event.status === 'approved' && eventDate >= now) {
      row.innerHTML = `
        <td>${event.title}</td>
        <td>${formatToMonDayYear(eventDate)}</td>
        <td>${convertTo12Hour(event.starttime)}</td>
        <td>${convertTo12Hour(event.endtime)}</td>
        <td>${event.location}</td>
        `;
        // <td>${event.description}</td>
        // <td>${event.email}</td>
        // <td>${event.type}</td>
      const removeBtn = document.createElement('button');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', openEditEventModal);
      removeBtn.textContent = 'Remove';
      removeBtn.dataset.id = event.id;
      removeBtn.dataset.email = event.email;
      removeBtn.addEventListener('click', removeEvent);
      const td = document.createElement('td');
      td.appendChild(removeBtn);
      td.appendChild(editBtn);
      row.appendChild(td);
      approvedtable.appendChild(row);
    }
    // code for responsive pivot table layout for movile screens
    document.querySelectorAll('table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
      table.querySelectorAll('tbody tr').forEach(row => {
        row.querySelectorAll('td').forEach((td, i) => {
          td.setAttribute('data-label', headers[i]);
        });
      });
    });
  })
})}


// Weekly Schedule Management

// add intverval button event listener

import { removeDayInterval, setDay, renderDaySchedule } from './dayschedule.js'

// Weekly schedule management END


// Dates schedule management START

import {removeDate, renderDatesSchedule, setDate, addDateInterval, removeDateInterval} from './datesschedule.js'

// dates schedule management END



// change 24:00 formate to 12:00 am/pm format
function convertTo12Hour(time24) {
  let [hours, minutes] = time24.split(':').map(Number);

  // Normalize 24:00 to 00:00
  if (hours === 24) hours = 0;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert hour 0 to 12 for AM
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// helper function to display specific dates in alpha-month-day-year format
function formatToMonDayYear(input) {
  const date = new Date(input);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${mon}-${day}-${year}`;
}


// initialize weekly schedule blocks on page load

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
for (const day of daysOfWeek) {
  renderDaySchedule(day);
}

renderDatesSchedule(); // Render the dates schedule on page load

fetchlist();
