const { DateTime } = luxon;
const eventForm = document.getElementById('eventForm');
const table = document.getElementById('pending-body');
const schedule = document.getElementById('approved-body');
const eventModal = document.getElementById('eventModal');
const cancelBtn = document.getElementById('cancelBtn');
const closeModal = document.getElementById('closeModal');

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

approvedenyEvent = (e) => {
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


removeEvent = (e) => {
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
    if (event.status === 'pending' && now >= eventDate) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${event.id}</td>
      <td>${event.title}</td>
      <td>${event.date}</td>
      <td>${event.starttime}</td>
      <td>${event.endtime}</td>
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
    } else if (event.status === 'approved' && now >= eventDate) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${event.id}</td>
        <td>${event.title}</td>
        <td>${event.date}</td>
        <td>${event.starttime}</td>
        <td>${event.endtime}</td>
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
  })
})}


// Weekly Schedule Management

// individual day submit
const setDay = (e) => {
  e.preventDefault();
  const dayBlock = e.target.closest('.day-block');
  const day = dayBlock.dataset.day;
  const error = dayBlock.querySelector('#overlapError');
  const start = dayBlock.querySelector('input[name="start"][data-set="false"]');
  const end = dayBlock.querySelector('input[name="end"][data-set="false"]');
  // Check for empty values
  if (start.value === '' || end.value === '') {
    error.textContent = 'Start and/or end time cannot be empty';
    error.style.display = 'block';
    return;
  }
  // Check if interval is not zero
  if (start.value > end.value ) {
    error.textContent = 'End time must be greater than start time';
    error.style.display = 'block';
    return;
  }
  // Check for interval overlap
  if (checkScheduleOverlap(day, start.value, end.value)) {
    error.textContent = 'Overlap detected with existing intervals';
    error.style.display = 'block';
    return;
  }
  const starts = [...dayBlock.querySelectorAll('input[name="start"]')];
  const ends = [...dayBlock.querySelectorAll('input[name="end"]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.value;
    const end = ends[index]?.value;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  console.log(intervals)
  // POST JSON to backend
  fetch("/admin/schedule/weekly", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day: day, times: intervals})
  })
  .then(res => res.text())
  .then(data => {
    console.log("Saved:", data);
  });
  renderDaySchedule(day); // Refresh the day's schedule after submission
  start.readOnly = true; // Set the start input to read-only after submission
  end.readOnly = true; // Set the end input to read-only after submission
  error.style.display = 'none'; // Hide the error message if it was displayed
  error.textContent = ''; // Clear the error message
  const addIntervalButton = dayBlock.querySelector('.add-interval');
  addIntervalButton.style.display = 'inline'; // Show the button again after submission
};

// Remove button event listener
const removeDayInterval = (e) => {
  e.preventDefault();
  const dayBlock = e.target.closest('.day-block');
  const day = dayBlock.dataset.day;
  const intervalDiv = e.target.closest('.interval');
  if (intervalDiv) {
    intervalDiv.remove(); // Remove the interval from the DOM
  }
  if (intervalDiv.querySelector('input[name="start"][data-set="false"]')) {
    console.log("Removing unsaved interval");
    dayBlock.querySelector('.add-interval').style.display = 'inline'; // Show the add interval button again
    dayBlock.querySelector('#overlapError').style.display = 'none'; // Hide any error messages
    return;
  }
  const starts = [...dayBlock.querySelectorAll('input[name="start"][data-set="true"]')];
  const ends = [...dayBlock.querySelectorAll('input[name="end"][data-set="true"]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.value;
    const end = ends[index]?.value;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  console.log(intervals)
  // POST JSON to backend
  fetch("/admin/schedule/weekly", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day: day, times: intervals})
  })
  .then(res => res.text())
  .then(data => {
    console.log("Saved:", data);
  });
  renderDaySchedule(day);
}  


// add intverval button event listener

document.querySelectorAll('.add-interval').forEach(button => {
  button.addEventListener('click', (e) => {
    const dayDiv = button.closest('.day-block');
    // const day = dayDiv.dataset.day;
    const intervalsContainer = dayDiv.querySelector('.intervals');
    const setBtn = document.createElement('button');
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', removeDayInterval);
    setBtn.textContent = 'Set';
    setBtn.addEventListener('click', setDay);
    const interval = document.createElement('div');
    interval.classList.add('interval');
    interval.innerHTML = `
      <label>Start: <input type="time" name="start" data-set="false"></label>
      <label>End: <input type="time" name="end" data-set="false"></label>
    `;
    interval.appendChild(setBtn);
    interval.appendChild(removeBtn);
    intervalsContainer.appendChild(interval);
    e.target.style.display = 'none'; // Hide the button after adding an interval
  });
});

// retrieve weekly schedule from backend

const renderDaySchedule = (day) => {
  fetch(`/admin/schedule/weekly?day=${day}`, {
    method: 'GET',
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
      console.log(data);
      const dayBlock = document.querySelector(`.day-block[data-day="${day}"]`);
      const intervalsContainer = dayBlock.querySelector('.intervals');
      intervalsContainer.innerHTML = ''; // Clear existing intervals
      const intervals = data.times;
      sortTimeIntervals(intervals); // Sort intervals before rendering
      if (intervals.length > 0) {
        intervals.forEach(interval => {
          const intervalDiv = document.createElement('div');
          intervalDiv.classList.add('interval');
          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Remove';
          removeBtn.addEventListener('click', removeDayInterval);
          intervalDiv.classList.add('interval');
          intervalDiv.innerHTML = `
            <label>Start: <input type="time" name="start" value=${interval[0]} data-set="true" readonly></label>
            <label>End: <input type="time" name="end" value=${interval[1]} data-set="true" readonly></label>
          `;
          intervalsContainer.appendChild(intervalDiv);
          intervalDiv.appendChild(removeBtn);
        });
      } else {
        const noIntervals = document.createElement('p');
        noIntervals.textContent = 'Not available';
        intervalsContainer.appendChild(noIntervals);
      }
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}
// Helper functions
// Checking of schedule overlap logic
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const checkScheduleOverlap = (day, start, end) => {
  const dayBlock = document.querySelector(`.day-block[data-day="${day}"]`);
  const intervals = dayBlock.querySelectorAll('.interval');

  const newStart = timeToMinutes(start);
  const newEnd = timeToMinutes(end);

  for (const interval of intervals) {
    const existingStartInputs = interval.querySelectorAll('input[data-set="true"][name="start"]');
    const existingEndInputs = interval.querySelectorAll('input[data-set="true"][name="end"]');

    const existingStarts = Array.from(existingStartInputs).map(input => timeToMinutes(input.value));
    const existingEnds = Array.from(existingEndInputs).map(input => timeToMinutes(input.value));

    for (let i = 0; i < existingStarts.length; i++) {
      const existingStart = existingStarts[i];
      const existingEnd = existingEnds[i];

      if (newStart < existingEnd && newEnd > existingStart) {
        return true; // Overlap found
      }
    }
  }

  return false; // No overlap
};

const checkDatesScheduleOverlap = (date, start, end) => {
  const dateBlock = document.querySelector(`.date-block[data-date="${date}"]`);
  const intervals = dateBlock.querySelectorAll('.interval');
  const newStart = timeToMinutes(start);
  const newEnd = timeToMinutes(end);


  for (const interval of intervals) {
    const existingStartInputs = interval.querySelectorAll('input[data-set="true"][name="start"]');
    const existingEndInputs = interval.querySelectorAll('input[data-set="true"][name="end"]');

    const existingStarts = Array.from(existingStartInputs).map(input => timeToMinutes(input.value));
    const existingEnds = Array.from(existingEndInputs).map(input => timeToMinutes(input.value));

    for (let i = 0; i < existingStarts.length; i++) {
      const existingStart = existingStarts[i];
      const existingEnd = existingEnds[i];

      if (newStart < existingEnd && newEnd > existingStart) {
        return true; // Overlap found
      }
    }
  }
  return false; // No overlap
};

// sort time intervals
const sortTimeIntervals = (intervals) => {
  intervals.sort((a, b) => {
  a[0].localeCompare(b[0]); // Compare first elements as strings
});
}

// sort dates
function sortIsoDates(dates) {
  return dates.sort();
}
// Weekly schedule management END

// Dates schedule management START

// Add new date button event listener
const adddateBtn = document.getElementById('addDate');

adddateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const dates = e.target.closest(".dates-form").querySelector('.dates');
  const dateDiv = document.createElement('div');
  dateDiv.classList.add('date-block');
  dateDiv.innerHTML = `
    <label>Date: <input type="date" name="date" data-set="false"></label>
    <p id="errorMessageDay" style="color: red; display: none"></p>
  `;
  const setDateBtn = document.createElement('button');
  setDateBtn.textContent = 'Set';
  setDateBtn.addEventListener('click', setDate);
  const removeDateBtn = document.createElement('button');
  removeDateBtn.textContent = 'Remove';
  removeDateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dateDiv.remove(); // Remove the date block from the DOM
  });
  dateDiv.appendChild(setDateBtn);
  dateDiv.appendChild(removeDateBtn);
  dates.appendChild(dateDiv);
});


// set date button event listener

const setDate = (e) => {
  e.preventDefault();
  const dateBlock = e.target.closest('.date-block');
  const dateInput = dateBlock.querySelector('input[name="date"]');
  if (dateInput.dataset.set === 'false') {
    const errorDay = dateBlock.querySelector('#errorMessageDay');
    // Check for empty value
    if (dateInput.value === '') {
      errorDay.textContent = 'Date cannot be empty';
      errorDay.style.display = 'block';
      return;
    }
  }
  const start = dateBlock.querySelector('input[name="start"][data-set="false"]');
  const end = dateBlock.querySelector('input[name="end"][data-set="false"]');
  if (start && end) {
    const errorInterval = dateBlock.querySelector('#errorMessageInterval');
    // Check for empty values
    if (start.value === '' || end.value === '') {
      errorInterval.textContent = 'Start and/or end time cannot be empty';
      errorInterval.style.display = 'block';
      return;
    }
    // Check if interval is not zero
    if (start.value > end.value ) {
      errorInterval.textContent = 'End time must be greater than start time';
      errorInterval.style.display = 'block';
      return;
    }
    // Check for interval overlap
    if (checkDatesScheduleOverlap(dateInput.value, start.value, end.value)) {
      errorInterval.textContent = 'Overlap detected with existing intervals';
      errorInterval.style.display = 'block';
      return;
    }
  }
  const starts = [...dateBlock.querySelectorAll('input[name="start"]')];
  const ends = [...dateBlock.querySelectorAll('input[name="end"]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.value;
    const end = ends[index]?.value;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  // POST JSON to backend
  fetch("/admin/schedule/dates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: dateInput.value, times: intervals})
  })
  .then(res => res.text())
  .then(data => {
    console.log("Saved:", data);
    dateBlock.dataset.date = dateInput.value; // Set the date attribute for the block
    dateInput.readOnly = true; // Set the input to read-only after submission
    // errorDay.style.display = 'none'; // <-- this line is giving me cannot read property 'style' of null
    // errorDay.textContent = ''; // Clear the error message
    // errorInterval.style.display = 'none'; // Hide the error message if it was displayed
    // errorInterval.textContent = ''; // Clear the error message
    renderDatesSchedule(); // Refresh the dates schedule after submission
  });
};

// Retrieve dates schedule from backend

const renderDatesSchedule = () => {
  fetch('/admin/schedule/dates', {
    method: 'GET',
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
      const datesContainer = document.getElementById('datesList');
      if (data.length === 0) {
        document.querySelector('.no-dates-msg').style.display = 'block';
      }
      datesContainer.innerHTML = ''; // Clear existing dates
      data.forEach(dateObj => {
        const dateBlock = document.createElement('div');
        dateBlock.classList.add('date-block');
        dateBlock.dataset.date = dateObj.date; // Set the date attribute for the block
        dateBlock.innerHTML = `
          <label>Date: <input type="date" name="date" value="${dateObj.date}" data-set="true" readonly></label>
          `;
        const removeDateBtn = document.createElement('button');
        removeDateBtn.textContent = 'Remove Date';
        removeDateBtn.addEventListener('click', removeDate);
        dateBlock.appendChild(removeDateBtn);
        const intervalsDiv = document.createElement('div');
        intervalsDiv.classList.add('intervals');
        const intervals = dateObj.times;
        sortTimeIntervals(intervals); // Sort intervals before rendering
        if (intervals.length > 0) {
          intervals.forEach(interval => {
            const intervalDiv = document.createElement('div');
            intervalDiv.innerHTML = `
              <label>Start: <input type="time" name="start" value="${interval[0]}" data-set="true" readonly></label>
              <label>End: <input type="time" name="end" value="${interval[1]}" data-set="true" readonly></label>
            `;
            intervalDiv.classList.add('interval');
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', removeDateInterval);
            intervalDiv.appendChild(removeBtn);
            // setBtn = document.createElement('button');
            // setBtn.textContent = 'Set';
            // setBtn.addEventListener('click', setDate);
            // intervalDiv.appendChild(setBtn);
            intervalsDiv.appendChild(intervalDiv);
          });
        } else {
          const noIntervals = document.createElement('p');
          noIntervals.textContent = 'Not available';
          intervalsDiv.appendChild(noIntervals);
        }
        const addIntervalButton = document.createElement('button');
        addIntervalButton.textContent = 'Add Interval';
        addIntervalButton.classList.add('add-interval-btn');
        addIntervalButton.addEventListener('click', addDateInterval);
        intervalsDiv.appendChild(addIntervalButton);
        dateBlock.appendChild(intervalsDiv);
        datesContainer.appendChild(dateBlock);
      });
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

const addDateInterval = (e) => {
  e.preventDefault();
  const dateBlock = e.target.closest('.date-block');
  const intervalsContainer = dateBlock.querySelector('.intervals');
  const setBtn = document.createElement('button');
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', removeDateInterval);
  setBtn.textContent = 'Set';
  setBtn.addEventListener('click', setDate);
  const interval = document.createElement('div');
  interval.classList.add('interval');
  interval.innerHTML = `
    <label>Start: <input type="time" name="start" data-set="false"></label>
    <label>End: <input type="time" name="end" data-set="false"></label>
    <p id="errorMessageInterval" style="color: red; display: none"></p>
  `;
  interval.appendChild(setBtn);
  interval.appendChild(removeBtn);
  intervalsContainer.appendChild(interval);
  e.target.style.display = 'none'; // Hide the button after adding an interval
}

const removeDateInterval = (e) => {
  e.preventDefault();
  const dateBlock = e.target.closest('.date-block');
  const date = dateBlock.dataset.date;
  const intervalDiv = e.target.closest('.interval');
  if (intervalDiv.querySelector('input[name="start"][data-set="false"]')) {
    console.log("Removing unsaved interval");
    dateBlock.querySelector('.add-interval-btn').style.display = 'inline'; // Show the add interval button again
    intervalDiv.remove(); // Remove the interval from the DOM
    return;
  }
  intervalDiv.remove(); // Remove the interval from the DOM
  const starts = [...dateBlock.querySelectorAll('input[name="start"][data-set="true"]')];
  const ends = [...dateBlock.querySelectorAll('input[name="end"][data-set="true"]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.value;
    const end = ends[index]?.value;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  console.log(intervals)
  // POST JSON to backend
  fetch("/admin/schedule/dates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: date, times: intervals})
  })
  .then(res => res.text())
  .then(data => {
    console.log("Saved:", data);
  });
  renderDatesSchedule(); // Refresh the dates schedule after submission
}

const removeDate = (e) => {
  e.preventDefault();
  const dateBlock = e.target.closest('.date-block');
  const date = dateBlock.dataset.date;
  fetch('/admin/schedule/dates', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date: date })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  }).then(data => {
      console.log("Date removed:", data);
      dateBlock.remove(); // Remove the date block from the DOM
      renderDatesSchedule(); // Refresh the dates schedule after removal
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
  renderDatesSchedule();
}

// dates schedule management END

// initialize weekly schedule blocks on page load

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
for (day of daysOfWeek) {
  renderDaySchedule(day);
}

renderDatesSchedule(); // Render the dates schedule on page load

fetchlist();

