// Calendar Functionality
import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3/build/es6/luxon.min.js';

let currentDate = DateTime.now().setZone('America/Chicago');
let events = []
let schedule = []
let dates = []
let times = []
let selectedSchedule = [];
// DOM Elements
const monthDisplay = document.getElementById('monthDisplay');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('today');
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const viewEventModal = document.getElementById('viewEventModal');
const closeModal = document.getElementById('closeModal');
const closeViewModal = document.getElementById('closeViewModal');
const eventForm = document.getElementById('eventForm');
const cancelBtn = document.getElementById('cancelBtn');
const eventsList = document.getElementById('eventsList');
const closeViewBtn = document.getElementById('closeViewBtn');

// Initialize the calendar
function initCalendar() {
		renderCalendar();
		renderEventsList();
		
		// Event listeners
		prevMonthBtn.addEventListener('click', () => {
        currentDate = currentDate.set({ month: currentDate.month - 1 });  // previous month
				renderCalendar();
		});
		
		nextMonthBtn.addEventListener('click', () => {
        currentDate = currentDate.set({ month: currentDate.month + 1 });  // previous month
				renderCalendar();
		});
		
		todayBtn.addEventListener('click', () => {
        currentDate = luxon.DateTime.now().setZone('America/Chicago');
				renderCalendar();
		});
		
		addEventBtn.addEventListener('click', () => {
				openAddEventModal();
		});
		
		closeModal.addEventListener('click', () => {
        document.querySelector('.modal-content').classList.remove('collapsed');
				eventModal.style.display = 'none';
		});
		
		closeViewModal.addEventListener('click', () => {
        document.querySelectorAll('.modal-content')[1].classList.remove('collapsed');
				viewEventModal.style.display = 'none';
		});
		
		closeViewBtn.addEventListener('click', () => {
				viewEventModal.style.display = 'none';
		});
		
		cancelBtn.addEventListener('click', () => {
				eventModal.style.display = 'none';
		});
		
		eventForm.addEventListener('submit', (e) => {
			e.preventDefault();
			saveEvent();
		});
}

// Render the calendar
function renderCalendar() {
  const year = currentDate.year;
  const month = currentDate.month;  // 1-12, Luxon style

  // Update the month display (month is 1-based so array index is month-1)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                      'August', 'September', 'October', 'November', 'December'];
  monthDisplay.textContent = `${monthNames[month - 1]} ${year}`;

  // Clear calendar grid
  calendarGrid.innerHTML = '';

  // Get first day of month and its weekday
  const firstDayOfMonth = currentDate.startOf('month');  // Luxon DateTime at first day of month
  const startingDay = firstDayOfMonth.weekday % 7; 


  // Get total days in current month
  const totalDays = firstDayOfMonth.daysInMonth;

  // Get last day of previous month for filling calendar grid before 1st
  const prevMonthLastDay = firstDayOfMonth.minus({ days: 1 }).day;

  // Days from previous month
  for (let i = startingDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonthDate = firstDayOfMonth.minus({ months: 1 }).set({ day });
    const dateStr = prevMonthDate.toISODate();

    const dayEl = createDayElement(day, dateStr, true);
    calendarGrid.appendChild(dayEl);
  }

  // Days of the current month
  for (let day = 1; day <= totalDays; day++) {
    const date = firstDayOfMonth.set({ day });
    const dateStr = date.toISODate();

    const dayEl = createDayElement(day, dateStr, false);

    // Check if it's today
    const today = DateTime.now().setZone('America/Chicago');
    if (day === today.day && month === today.month && year === today.year) {
      dayEl.classList.add('today');
    }

    calendarGrid.appendChild(dayEl);
  }

  // Days from next month
  const daysFromNextMonth = 42 - (startingDay + totalDays);
  for (let day = 1; day <= daysFromNextMonth; day++) {
    const nextMonthDate = firstDayOfMonth.plus({ months: 1 }).set({ day });
    const dateStr = nextMonthDate.toISODate();

    const dayEl = createDayElement(day, dateStr, true);
    calendarGrid.appendChild(dayEl);
  }
}
// Create a day element
function createDayElement(day, dateStr, inactive) {
		const dayEl = document.createElement('div');
		dayEl.classList.add('calendar-day');
		if (inactive) {
			dayEl.classList.add('inactive');
		} else {
      dayEl.classList.add('active');
    }
		
		const dateNum = document.createElement('div');
		dateNum.classList.add('date-num');
		dateNum.textContent = day;
		dayEl.appendChild(dateNum);
		const dayofweek = getLocalWeekdayFromISO(dateStr) // 0 = Sunday, 1 = Monday, etc.
    if (dates.indexOf(dateStr) !== -1) {
      if (times[dates.indexOf(dateStr)].length > 0) {
        dayEl.classList.add('clickable');
        dayEl.addEventListener('click', () => {
            openAddEventModal(dateStr, times[dates.indexOf(dateStr)]); // pass the times for that date
        });
        console.log(times[dates.indexOf(dateStr)]);
      }
    } else if (dateStr >= formatDate(new Date()) && schedule[dayofweek].times.length > 0) {
      dayEl.classList.add('clickable');
      dayEl.addEventListener('click', (e) => {
          openAddEventModal(dateStr, schedule[dayofweek].times);
      });
      console.log(schedule[dayofweek].times);
    }

		// Add events for this day
		const dayEvents = events.filter(e => e.date === dateStr);
		dayEvents.forEach(event => {
				const eventEl = document.createElement('div');
				eventEl.classList.add('event');
				eventEl.textContent = event.title;
				eventEl.style.backgroundColor = 'var(--accent)';
				eventEl.style.color = getContrastColor('var(--white)');
				
				eventEl.addEventListener('click', (e) => {
						e.stopPropagation();
						openViewEventModal(event.id);
				});
				
				dayEl.appendChild(eventEl);
		});
		
		return dayEl;
}
// helper function to format date for local weekday
function getLocalWeekdayFromISO(isoDateStr) {
  const [year, month, day] = isoDateStr.split('-').map(Number);
  // Month is 0-indexed in JS Date (0 = January)
  return new Date(year, month - 1, day).getDay();
}

// Get contrast color for text based on background
function getContrastColor(hexColor) {
		// Remove the # if present
		hexColor = hexColor.replace('#', '');
		
		// Parse the hex values
		const r = parseInt(hexColor.substr(0, 2), 16);
		const g = parseInt(hexColor.substr(2, 2), 16);
		const b = parseInt(hexColor.substr(4, 2), 16);
		
		// Calculate the brightness
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		
		// Return white or black based on brightness
		return brightness > 128 ? '#000000' : '#ffffff';
}

// Open the add event modal
function openAddEventModal(dateStr = '', times = []) {
		document.getElementById('modalTitle').textContent = 'Add New Event';
		document.getElementById('eventId').value = '';
		document.getElementById('eventTitle').value = '';
		document.getElementById('eventDate').value = dateStr || formatDate(new Date());
		document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('eventLocation').value = '';
		document.getElementById('eventDescription').value = '';
    document.getElementById('eventEmail').value = '';
    document.querySelectorAll('input[name="eventType"]').forEach(input => {
        input.checked = false;
    });
		selectedSchedule = times; // Store the schedule for this date
		eventModal.style.display = 'block';
    document.querySelector('.client-error').style.display = 'none';
    eventModal.querySelector('form').style.display = 'block';
}


// Open the view event modal
function openViewEventModal(eventId) {
	const event = events.find(e => e.id === eventId);
	if (!event) {
		console.log('no event')
		return;}
		document.querySelectorAll('.modal-content')[1].classList.add('collapsed');
		document.getElementById('viewEventTitle').textContent = event.title;
		document.getElementById('viewEventDate').textContent = formatDateForDisplay(event.date);
    const start = formatTime(event.starttime);
    const end = formatTime(event.endtime);
    document.getElementById('viewEventLocation').textContent = event.location || 'No location specified';
    document.getElementById('viewEventDescription').textContent = event.description || 'No description';
		document.getElementById('viewEventTime').textContent = `from ${start} to ${end}`;
		viewEventModal.dataset.eventId = event.id;
		viewEventModal.style.display = 'block';
}

// Save an event
function saveEvent() {
		const title = document.getElementById('eventTitle').value;
		const date = document.getElementById('eventDate').value;
		const starttime = document.getElementById('startTime').value;
    const endtime = document.getElementById('endTime').value;
    const location = document.getElementById('eventLocation').value;
		const description = document.getElementById('eventDescription').value;
    const errormsg = document.querySelector('.client-error')
    const email = document.getElementById('eventEmail').value;
    // client side checks for proper times input and checking either public or private event type
    if (starttime === '' || endtime === '') {
        errormsg.style.display = 'block';
        errormsg.textContent = "must fill out time slots";
        return;
      }
      // Check if interval is not zero
      if (starttime >= endtime ) {
        errormsg.style.display = 'block';
        errormsg.textContent = "start time must be less then end time";
        return;
      }
      if (!checkSchedule(selectedSchedule, starttime, endtime)) {
        errormsg.style.display = 'block';
        errormsg.textContent = "time slot is not available";
        return;
      }
    const checked = document.querySelector('input[name="eventType"]:checked')
    if (!checked) {
      errormsg.style.display = 'block';
      errormsg.textContent = "need to check public or private";
      return;
    }

		else {
        const type = checked.value
				// Add new event
				const newEvent = {
						title,
						date,
						starttime,
            endtime,
            location,
						description,
            type,
            email,
				};
				fetch('/', {
								method: 'POST',
								headers: {
										'Content-Type': 'application/json'
								},
								body: JSON.stringify(newEvent)
						}).then(res => res.text()).then(response => {
								console.log('Server response:', response);
						}).catch(err => {
								console.error('Fetch error:', err);
                return;
						});
		}
						
		// Remove form and show success message
    eventModal.querySelector('form').style.display = 'none';
    document.querySelector('.modal-content').classList.add('collapsed');
    const submitmessage = document.getElementById('modalTitle');

    // Step 1: Fade out
    submitmessage.classList.add('hidden');

    // Step 2: Wait for fade out to finish, then change text
    setTimeout(() => {
      submitmessage.textContent = 'Event Request Submitted';

      // Step 3: Fade back in
      submitmessage.classList.remove('hidden');
    }, 500); // match your CSS transition duration
		errormsg.style.display = 'none';
		// Refresh the calendar and events list
		renderCalendar();
		renderEventsList();
}


// Render the events list
function renderEventsList() {
		eventsList.innerHTML = '';
		// Sort events by date
		const sortedEvents = [...events].sort((a, b) => {
				return new Date(a.date) - new Date(b.date);
		});
		
		// Filter to show only upcoming events
		const currenttime = DateTime.now().setZone('America/Chicago');
    const currentdate = currenttime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
		
		const upcomingEvents = sortedEvents.filter(event => {
        const eventDate = DateTime.fromISO(event.date, { zone: 'America/Chicago' });
				return eventDate >= currentdate;
		});
		
		if (upcomingEvents.length === 0) {
				const noEvents = document.createElement('p');
				noEvents.textContent = 'No upcoming events';
				eventsList.appendChild(noEvents);
				return;
		}
		
		// Group events by date
		const eventsByDate = {};
		upcomingEvents.forEach(event => {
				if (!eventsByDate[event.date]) {
						eventsByDate[event.date] = [];
				}
				eventsByDate[event.date].push(event);
		});
		
		// Create event items grouped by date
		Object.keys(eventsByDate).forEach(date => {
				const dateHeader = document.createElement('h3');
				dateHeader.textContent = formatDateForDisplay(date);
				eventsList.appendChild(dateHeader);
				
				eventsByDate[date].forEach(event => {
						const eventItem = document.createElement('div');
						eventItem.classList.add('event-item');
						
						const eventInfo = document.createElement('div');
						eventInfo.classList.add('event-info');
						
						const eventColorDot = document.createElement('div');
						eventColorDot.classList.add('event-color');
						eventColorDot.style.backgroundColor = 'var(--accent)';
						
						const eventTitle = document.createElement('div');
            const start = formatTime(event.starttime);
            const end = formatTime(event.endtime);
						eventTitle.textContent = `${event.title} from ${start} to ${end}`;


						
						eventInfo.appendChild(eventColorDot);
						eventInfo.appendChild(eventTitle);
						
						const eventActions = document.createElement('div');
						eventActions.classList.add('event-actions');
						
						const viewBtn = document.createElement('button');
						viewBtn.textContent = 'View';
						viewBtn.classList.add('btn', 'btn-secondary');
						viewBtn.addEventListener('click', () => {
								openViewEventModal(event.id);
						});
						
						eventActions.appendChild(viewBtn);
						
						eventItem.appendChild(eventInfo);
						eventItem.appendChild(eventActions);
						
						eventsList.appendChild(eventItem);
				});
		});
}

// Helper function to format date
function formatDate(date) {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateForDisplay(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
	const date = new Date(year, month - 1, day); // month is 0-based
	return date.toLocaleDateString('en-US', { 
		weekday: 'short', 
		month: 'short', 
		day: 'numeric',
		year: 'numeric'
	});
}

// Helper function to format time
function formatTime(input) {
  const [hour, minute] = input.split(":");
      let h = parseInt(hour, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${minute} ${ampm}`
}

async function fetchEvents() {
	try {
		const res = await fetch('/retrieve');
		if (!res.ok) throw new Error('Fetch failed');
		const data = await res.json();
		return data;
	} catch (err) {
		console.error('Fetch error:', err);
		return [];
	}
}

async function fetchSchedule() {
  try {
    const res = await fetch('/schedule');
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    return {};
  }
}

async function fetchDates() {
  try {
    const res = await fetch('/dates');
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch eror:', err);
    return {};
  }
}

// Checking of schedule logic for form input
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
const checkSchedule = (times, start, end) => {
  // initialize start and end times being input
  const newStart = timeToMinutes(start);
  const newEnd = timeToMinutes(end);
  // check if inputs fall outside of the schedule
  for (const time of times) {
    const existingStartInput = time[0];
    const existingEndInput = time[1];

    const existingStart = timeToMinutes(existingStartInput);
    const existingEnd = timeToMinutes(existingEndInput);

    if (newStart >= existingStart && newEnd <= existingEnd) {
      return true;
    }
  }
  return false;
};

// Initialize the calendar when the page loads
(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    events = await fetchEvents();
    schedule = await fetchSchedule();
    const data = await fetchDates();
    if (data.length > 0) {
      for (const item of data) {
        times.push(item.times)
        dates.push(item.date)
      }
    }
    initCalendar();
  })
})();

