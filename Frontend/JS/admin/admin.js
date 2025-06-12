import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3/build/es6/luxon.min.js';

const eventForm = document.getElementById('eventForm');
const table = document.getElementById('pending-body');
const schedule = document.getElementById('approved-body');
const eventModal = document.getElementById('eventModal');
const cancelBtn = document.getElementById('cancelBtn');
const closeModal = document.getElementById('closeModal');
// get tab buttons and containers for nav bar function
const eventsBtn = document.getElementById('eventsBtn');
const scheduleBtn = document.getElementById('scheduleBtn');
const eventsContainer = document.querySelector('.events-container')
const scheduleContainer = document.querySelector('.schedule-container')
// add event listeners to show and hide events interface and schedule interface
eventsBtn.addEventListener('click', () => {
  eventsContainer.classList.remove('hidden');
  scheduleContainer.classList.add('hidden');
})
scheduleBtn.addEventListener('click', () => {
  scheduleContainer.classList.remove('hidden');
  eventsContainer.classList.add('hidden');
})

closeModal.addEventListener('click', () => {
  eventModal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  		eventModal.style.display = 'none';
  });



const editEvent = (e) => {
  eventModal.style.display = 'none';

  fetch('/admin/events/edit', {
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
}

const approvedenyEvent = (e) => {
  fetch('/admin/events', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: e.target.dataset.id, action: e.target.dataset.action }),
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

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  editEvent('edit');
});


const removeEvent = (e) => {
  fetch('/admin/events', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: e.target.dataset.id})
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
  document.querySelector('input[value="public"').checked = false;
  document.querySelector('input[value="private"]').checked = false;
  document.getElementById('eventId').value = e.target.dataset.id;
  document.getElementById('eventTitle').value = e.target.dataset.title;
  document.getElementById('eventDate').value = e.target.dataset.date;
  document.getElementById('startTime').value = e.target.dataset.starttime;
  document.getElementById('endTime').value = e.target.dataset.endtime;
  document.getElementById('eventLocation').value = e.target.dataset.location;
  document.getElementById('eventDescription').value = e.target.dataset.description;
  const eventTypeValue = e.target.dataset.type;
  document.querySelector(`input[value=${eventTypeValue}]`).checked = true;
  
  eventModal.style.display = 'block';
}

  
const fetchlist = () => {fetch('/admin/list', {
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
  table.innerHTML = ''; // Clear existing rows
  schedule.innerHTML = ''; // Clear existing rows
  // Loop through the data and create table rows
  data.forEach(event => {
    // Check if the event is pending and the date is today or in the future
    const eventDate = DateTime.fromISO(event.date, { zone: 'America/Chicago' });
    const now = DateTime.now().setZone('America/Chicago');
    if (event.status === 'pending' && eventDate >= now) {
    console.log('appending rows')
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${event.id}</td>
      <td>${event.title}</td>
      <td>${formatToMonDayYear(event.date)}</td>
      <td>${convertTo12Hour(event.starttime)}</td>
      <td>${convertTo12Hour(event.endtime)}</td>
      <td>${event.location}</td>
      <td>${event.description}</td>
      <td>${event.type}</td>
    `;
    const approveBtn = document.createElement('button');
    approveBtn.textContent = 'Approve';
    approveBtn.dataset.id = event.id;
    approveBtn.dataset.title = event.title;
    approveBtn.dataset.date = event.date;
    approveBtn.dataset.starttime = event.starttime;
    approveBtn.dataset.endtime = event.endtime;
    approveBtn.dataset.location = event.location;
    approveBtn.dataset.description = event.description;
    approveBtn.dataset.type = event.type;

    approveBtn.dataset.action = 'approve';
    approveBtn.addEventListener('click', approvedenyEvent);

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.dataset.id = event.id;
    rejectBtn.dataset.action = 'reject';
    rejectBtn.addEventListener('click', approvedenyEvent);

    const td = document.createElement('td');
    td.appendChild(approveBtn);
    td.appendChild(rejectBtn);
    row.appendChild(td);
    // Append the row to the table pending table
    table.appendChild(row);
    // check if the event is approved and the date is today or in the future
    } else if (event.status === 'approved' && eventDate >= now) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${event.id}</td>
        <td>${event.title}</td>
        <td>${formatToMonDayYear(event.date)}</td>
        <td>${convertTo12Hour(event.starttime)}</td>
        <td>${convertTo12Hour(event.endtime)}</td>
        <td>${event.location}</td>
        <td>${event.description}</td>
        <td>${event.type}</td>
      `;
      const removeBtn = document.createElement('button');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.dataset.id = event.id;
      editBtn.dataset.title = event.title;
      editBtn.dataset.date = event.date;
      editBtn.dataset.starttime = event.starttime;
      editBtn.dataset.endtime = event.endtime;
      editBtn.dataset.location = event.location;
      editBtn.dataset.description = event.description;
      editBtn.dataset.type = event.type;
      editBtn.addEventListener('click', openEditEventModal);
      removeBtn.textContent = 'Remove';
      removeBtn.dataset.id = event.id;
      removeBtn.addEventListener('click', removeEvent);

      schedule.appendChild(row);
      const td = document.createElement('td');
      td.appendChild(removeBtn);
      td.appendChild(editBtn);
      row.appendChild(td);
    }
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
