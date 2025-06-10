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
    if (event.status === 'pending' && eventDate >= now) {
    console.log('appending rows')
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

// add intverval button event listener

document.querySelectorAll('.add-interval').forEach(button => {
  button.addEventListener('click', (e) => {
    //select the intervals div to add a new interval div
    const dayBlock = e.target.closest('.day-block');
    const intervalsDiv = dayBlock.querySelector('.intervals')
    const setBtn = document.createElement('button');
    setBtn.textContent = 'Set';
    setBtn.addEventListener('click', setDay);
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', removeDayInterval);
    const interval = document.createElement('div');
    interval.classList.add('interval');
    interval.innerHTML = `
      <label>Start: <input type="time" name="start"></label>
      <label>End: <input type="time" name="end"></label>
    `;
    interval.appendChild(setBtn);
    interval.appendChild(removeBtn);
    intervalsDiv.appendChild(interval);
    e.target.style.display = 'none'; // Hide the button after adding an interval
  });
});


// Remove button event listener
const removeDayInterval = (e) => {
  const dayBlock = e.target.closest('.day-block');
  const day = dayBlock.dataset.day;
  const intervalDiv = e.target.closest('.interval');
  if (intervalDiv.querySelector('input[name="start"]')) {
    dayBlock.querySelector('.add-interval').style.display = 'inline'; // Show the add interval button again
    dayBlock.querySelector('#overlapError').style.display = 'none'; // Hide any error messages
    intervalDiv.remove();
    return;
  }
  intervalDiv.remove();
  const starts = [...dayBlock.querySelectorAll('[data-start]')];
  const ends = [...dayBlock.querySelectorAll('[data-end]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.dataset.start;
    const end = ends[index]?.dataset.end;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
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

// individual day submit
const setDay = (e) => {
  const dayBlock = e.target.closest('.day-block');
  const day = dayBlock.dataset.day;
  const error = dayBlock.querySelector('#overlapError');
  const start = dayBlock.querySelector('input[name="start"]');
  const end = dayBlock.querySelector('input[name="end"]');
  // Check for empty values
  if (start.value === '' || end.value === '') {
    error.textContent = 'Start and/or end time cannot be empty';
    error.style.display = 'block';
    return;
  }
  // Check if interval is not zero
  if (start.value >= end.value ) {
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
  // collect interval start and end times into an array
  const starts = [...dayBlock.querySelectorAll('[data-start]')];
  const ends = [...dayBlock.querySelectorAll('[data-end]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.dataset.start;
    const end = ends[index]?.dataset.end;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  intervals.push([start.value, end.value])
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
  error.style.display = 'none'; // Hide the error message if it was displayed
  error.textContent = ''; // Clear the error message
  dayBlock.querySelector('.add-interval').style.display = 'inline'; // Show the button again after submission
};


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
  })
  .then(data => {
    const dayBlock = document.querySelector(`.day-block[data-day="${day}"]`);
    const intervalsDiv = dayBlock.querySelector('.intervals');
    intervalsDiv.innerHTML = ''; // Clear existing intervals
    const intervals = data.times;
    sortTimeIntervals(intervals); // Sort intervals before rendering
    if (intervals.length > 0) {
      intervals.forEach(interval => {
      const intervalDiv = document.createElement('div');
      intervalDiv.classList.add('interval');
      //create remove button and add event listener
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', removeDayInterval);
      //convert interval data to render in 12:00 am/pm format
      const start = convertTo12Hour(interval[0])
      const end = convertTo12Hour(interval[1])
      intervalDiv.innerHTML = `
        <p data-start=${interval[0]}>Start: ${start}</p>
        <p data-end=${interval[1]}>End: ${end}</p>
      `;
      // attach interval and remove button
      intervalsDiv.appendChild(intervalDiv);
      intervalDiv.appendChild(removeBtn);
      });
    } else {
      // if no intervals display no availability
      const noIntervals = document.createElement('p');
      noIntervals.textContent = 'Not available';
      intervalsDiv.appendChild(noIntervals);
    }
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

// Weekly schedule management END


// Dates schedule management START

// Add new date button event listener
const adddateBtn = document.getElementById('addDate');
adddateBtn.addEventListener('click', (e) => {
  const datesContainer = document.getElementById('datesList');
  const dateBlock = document.createElement('div');
  dateBlock.classList.add('date-block');
  dateBlock.innerHTML = `
    <label>Date: <input type="date" name="date" data-date='none'></label>
    <p id="errorMessageDay" style="color: red; display: none"></p>
  `;
  const setDateBtn = document.createElement('button');
  setDateBtn.textContent = 'Set';
  setDateBtn.addEventListener('click', setDate);
  const removeDateBtn = document.createElement('button');
  removeDateBtn.textContent = 'Remove';
  removeDateBtn.addEventListener('click', removeDate);
  const intervalsDiv = document.createElement('div')
  intervalsDiv.classList.add('intervals')
  dateBlock.appendChild(intervalsDiv);
  dateBlock.appendChild(setDateBtn);
  dateBlock.appendChild(removeDateBtn);
  datesContainer.appendChild(dateBlock);
});


//remove Date button event listener
const removeDate = (e) => {
  const dateBlock = e.target.closest('.date-block');
  const date = dateBlock.dataset.date;
  //if no date set yet, just remove dateblock
  if (!date) {
    dateBlock.remove();
    return;
  }
  // remove date row from backend
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
  //rerender specific dates schedule
  renderDatesSchedule();
}


// set date button event listener
const setDate = (e) => {
  const dateBlock = e.target.closest('.date-block');
  const dateInput = dateBlock.querySelector('[data-date]');
  // if date not yet apply client side validation and set dataset attribute to current value
  if (dateInput.dataset.date === 'none') {
    if (dateInput.value === '') {
    const errorDay = dateBlock.querySelector('#errorMessageDay');
    errorDay.textContent = 'Must select a date';
    errorDay.style.display = 'block';
    return;
    }
    dateInput.dataset.date = dateInput.value;
  }
  const intervalsDiv = dateBlock.querySelector('.intervals');
  // attempt to get values from time interval inputs
  const start = intervalsDiv.querySelector('input[name="start"]');
  const end = intervalsDiv.querySelector('input[name="end"]');
  // if inputs exist, apply client side validation
  if (start && end) {
    const errorInterval = dateBlock.querySelector('#errorMessageInterval');
    // Check for empty values
    if (start.value === '' || end.value === '') {
      errorInterval.textContent = 'Start and/or end time cannot be empty';
      errorInterval.style.display = 'block';
      return;
    }
    // Check if interval is not zero
    if (start.value >= end.value ) {
      errorInterval.textContent = 'End time must be greater than start time';
      errorInterval.style.display = 'block';
      return;
    }
    // Check for interval overlap
    if (checkScheduleOverlap(dateInput.dataset.date, start.value, end.value)) {
      errorInterval.textContent = 'Overlap detected with existing intervals';
      errorInterval.style.display = 'block';
      return;
    }
  }
  // send all time intervals with date to back end
  const starts = [...intervalsDiv.querySelectorAll('[data-start]')];
  const ends = [...intervalsDiv.querySelectorAll('[data-end]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.dataset.start;
    const end = ends[index]?.dataset.end;
    if (start && end) {
      return [ start, end ];
    }
    return null;
  }).filter(Boolean);
  if (start && end) {
    intervals.push([start.value, end.value]);
  }
  // if no time intervals set, intervals with be [] implying no availability
  fetch("/admin/schedule/dates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: dateInput.dataset.date, times: intervals})
  })
  .then(res => res.text())
  .then(data => {
    console.log("Saved:", data);
    // dateBlock.dataset.date = dateInput.dataset.date; // Set the date attribute for the block
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
      datesContainer.innerHTML = ''; // Clear existing dates
      if (data.length === 0) {
        document.querySelector('.no-dates-msg').style.display = 'block';
      } else {
        document.querySelector('.no-dates-msg').style.display = 'none';
      }
      const dates = sortByDateAsc(data)
      dates.forEach(dateObj => {
        const dateBlock = document.createElement('div');
        dateBlock.classList.add('date-block');
        dateBlock.dataset.date = dateObj.date; // Set the date attribute for the block
        dateBlock.innerHTML = `
          <p data-date=${dateObj.date}>Date: ${dateObj.date}</p>
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
            const start = convertTo12Hour(interval[0])
            const end = convertTo12Hour(interval[1])
            const intervalDiv = document.createElement('div');
            intervalDiv.innerHTML = `
              <p data-start=${interval[0]}>Start: ${start}</p>
              <p data-end=${interval[1]}>End: ${end}</p>
            `;
            intervalDiv.classList.add('interval');
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', removeDateInterval);
            intervalDiv.appendChild(removeBtn);
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


//add time interval button event listener
const addDateInterval = (e) => {
  const intervalsDiv = e.target.closest('.intervals');
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', removeDateInterval);
  const setBtn = document.createElement('button');
  setBtn.textContent = 'Set';
  setBtn.addEventListener('click', setDate);
  const interval = document.createElement('div');
  interval.classList.add('interval');
  interval.innerHTML = `
    <label>Start: <input type="time" name="start"></label>
    <label>End: <input type="time" name="end"></label>
    <p id="errorMessageInterval" style="color: red; display: none"></p>
  `;
  interval.appendChild(setBtn);
  interval.appendChild(removeBtn);
  intervalsDiv.appendChild(interval);
  e.target.style.display = 'none'; // Hide the button after adding an interval
}


//
const removeDateInterval = (e) => {
  const dateBlock = e.target.closest('.date-block');
  const date = dateBlock.dataset.date;
  const intervalDiv = e.target.closest('.interval');
  if (intervalDiv.querySelector('input[name="start"]')) {
    dateBlock.querySelector('.add-interval-btn').style.display = 'inline'; // Show the add interval button again
    intervalDiv.remove(); // Remove the interval from the DOM
    return;
  }
  intervalDiv.remove(); // Remove the interval from the DOM
  const starts = [...dateBlock.querySelectorAll('[data-start]')];
  const ends = [...dateBlock.querySelectorAll('[data-end]')];
  const intervals = starts.map((startInput, index) => {
    const start = startInput.dataset.start;
    const end = ends[index]?.dataset.end;
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

// dates schedule management END


//helper functions START

// change 24:00 formate to 12:00 am/pm format
function convertTo12Hour(time24) {
  let [hours, minutes] = time24.split(':').map(Number);

  // Normalize 24:00 to 00:00
  if (hours === 24) hours = 0;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert hour 0 to 12 for AM
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}


// Checking of schedule overlap logic
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const checkScheduleOverlap = (day, start, end) => {
  let dayBlock;
  // if day is week day select day-block else select date-block
  if (daysOfWeek.includes(day)) {
    dayBlock = document.querySelector(`.day-block[data-day="${day}"]`);
  } else {
    dayBlock = document.querySelector(`.date-block[data-date="${day}"]`);
  }
  // initialize start and end times being input
  const newStart = timeToMinutes(start);
  const newEnd = timeToMinutes(end);
  // check for overlap with all existing time intervals
  const intervals = dayBlock.querySelectorAll('.interval');
  for (const interval of intervals) {
    const existingStartInputs = interval.querySelectorAll('[data-start]');
    const existingEndInputs = interval.querySelectorAll('[data-end]');

    const existingStarts = Array.from(existingStartInputs).map(input => timeToMinutes(input.dataset.start));
    const existingEnds = Array.from(existingEndInputs).map(input => timeToMinutes(input.dataset.end));

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
  intervals.sort((a, b) => a[0].localeCompare(b[0]));
}

// sort dates
function sortByDateAsc(arr) {
  return arr.sort((a, b) => a.date.localeCompare(b.date));
}

// helper functions END

// initialize weekly schedule blocks on page load

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
for (day of daysOfWeek) {
  renderDaySchedule(day);
}

renderDatesSchedule(); // Render the dates schedule on page load

fetchlist();

