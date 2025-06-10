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

export { removeDayInterval, setDay, renderDaySchedule }