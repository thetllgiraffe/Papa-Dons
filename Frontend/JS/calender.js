// Calendar Functionality
let currentDate = new Date();
let events = []

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
const deleteEventBtn = document.getElementById('deleteEventBtn');
const eventsList = document.getElementById('eventsList');
// const colorOptions = document.querySelectorAll('.color-option');
// const eventColor = document.getElementById('eventColor');
// const editEventBtn = document.getElementById('editEventBtn');
const closeViewBtn = document.getElementById('closeViewBtn');

// Initialize the calendar
function initCalendar() {
		renderCalendar();
		renderEventsList();
		
		// Event listeners
		prevMonthBtn.addEventListener('click', () => {
				currentDate.setMonth(currentDate.getMonth() - 1);
				renderCalendar();
		});
		
		nextMonthBtn.addEventListener('click', () => {
				currentDate.setMonth(currentDate.getMonth() + 1);
				renderCalendar();
		});
		
		todayBtn.addEventListener('click', () => {
				currentDate = new Date();
				renderCalendar();
		});
		
		addEventBtn.addEventListener('click', () => {
				openAddEventModal();
		});
		
		closeModal.addEventListener('click', () => {
				eventModal.style.display = 'none';
		});
		
		closeViewModal.addEventListener('click', () => {
				viewEventModal.style.display = 'none';
		});
		
		closeViewBtn.addEventListener('click', () => {
				viewEventModal.style.display = 'none';
		});
		
		// cancelBtn.addEventListener('click', () => {
		// 		eventModal.style.display = 'none';
		// });

		// editEventBtn.addEventListener('click', () => {
		// 	const eventId = viewEventModal.dataset.eventId;
		// 	console.log(eventId)
		// 	openEditEventModal(eventId);
		// 	viewEventModal.style.display = 'none';
		// });
		
		eventForm.addEventListener('submit', (e) => {
			e.preventDefault();
			saveEvent();
		});
}

// Render the calendar
function renderCalendar() {

    const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		
		// Update the month display
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		monthDisplay.textContent = `${monthNames[month]} ${year}`;
		
		// Clear the calendar grid
		calendarGrid.innerHTML = '';
		
		// Get the first day of the month
		const firstDay = new Date(year, month, 1);
		const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
		
		// Get the last day of the month
		const lastDay = new Date(year, month + 1, 0);
		const totalDays = lastDay.getDate();
		
		// Get the last day of the previous month
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		
		// Days from previous month
		for (let i = startingDay - 1; i >= 0; i--) {
				const day = prevMonthLastDay - i;
				const prevMonth = month === 0 ? 11 : month - 1;
				const prevYear = month === 0 ? year - 1 : year;
				const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
				
				const dayEl = createDayElement(day, dateStr, true);
				calendarGrid.appendChild(dayEl);
		}
		
		// Days of the current month
		for (let day = 1; day <= totalDays; day++) {
				const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
				
				const dayEl = createDayElement(day, dateStr, false);
				
				// Check if it's today
				const today = new Date();
				if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
						dayEl.classList.add('today');
				}
				
				calendarGrid.appendChild(dayEl);
		}
		
		// Days from next month
		const daysFromNextMonth = 42 - (startingDay + totalDays);
		for (let day = 1; day <= daysFromNextMonth; day++) {
				const nextMonth = month === 11 ? 0 : month + 1;
				const nextYear = month === 11 ? year + 1 : year;
				const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
				
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
		}
		
		const dateNum = document.createElement('div');
		dateNum.classList.add('date-num');
		dateNum.textContent = day;
		dayEl.appendChild(dateNum);
		
		// Add event for opening the add event modal
    if (!inactive) {
      dayEl.classList.add('clickable');
      dayEl.addEventListener('click', () => {
          openAddEventModal(dateStr);
      });
    }
		// Add events for this day
		const dayEvents = events.filter(e => e.date === dateStr);
		dayEvents.forEach(event => {
				const eventEl = document.createElement('div');
				eventEl.classList.add('event');
				eventEl.textContent = event.title;
				eventEl.style.backgroundColor = '#4361ee';
				eventEl.style.color = getContrastColor('#4361ee');
				
				eventEl.addEventListener('click', (e) => {
						e.stopPropagation();
						openViewEventModal(event.id);
				});
				
				dayEl.appendChild(eventEl);
		});
		
		return dayEl;
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
function openAddEventModal(dateStr = '') {
		document.getElementById('modalTitle').textContent = 'Add New Event';
		document.getElementById('eventId').value = '';
		document.getElementById('eventTitle').value = '';
		document.getElementById('eventDate').value = dateStr || formatDate(new Date());
		document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('eventLocation').value = '';
		document.getElementById('eventDescription').value = '';

		
		// Hide the delete button
		deleteEventBtn.style.display = 'none';
		
		eventModal.style.display = 'block';
}


// Open the view event modal
function openViewEventModal(eventId) {
	const event = events.find(e => e.id === eventId);
	if (!event) {
		console.log('no event')
		return;}
		
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
		
		if (!title || !date) {
				alert('Please enter a title and date');
				return;
		}

		else {
				// Add new event
				const newEvent = {
						title,
						date,
						starttime,
            endtime,
            location,
						description,
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
						});
		}
						
		// Close the modal
		eventModal.style.display = 'none';
		
		// Refresh the calendar and events list
		renderCalendar();
		renderEventsList();
}

// Delete an event
function deleteEvent() {
		const eventId = document.getElementById('eventId').value;
		if (!eventId) return;
		
		if (confirm('Are you sure you want to delete this event?')) {
				events = events.filter(e => e.id !== eventId);
				localStorage.setItem('events', JSON.stringify(events));
				
				eventModal.style.display = 'none';
				renderCalendar();
				renderEventsList();
		}
}


// Render the events list
function renderEventsList() {
		eventsList.innerHTML = '';
		// Sort events by date
		const sortedEvents = [...events].sort((a, b) => {
				return new Date(a.date) - new Date(b.date);
		});
		
		// Filter to show only upcoming events
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const upcomingEvents = sortedEvents.filter(event => {
				const eventDate = new Date(event.date);
				return eventDate >= today;
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
						eventColorDot.style.backgroundColor = '#4361ee';
						
						const eventTitle = document.createElement('div');
            const start = formatTime(event.starttime);
            const end = formatTime(event.endtime);
						eventTitle.textContent = `${event.title} from ${start} to ${end}`;

            // const eventLocation = document.createElement('div');
            // eventLocation.textContent = event.location ? `${event.location}` : 'No location specified';
						
						eventInfo.appendChild(eventColorDot);
						eventInfo.appendChild(eventTitle);
            // eventInfo.appendChild(eventLocation);
						
						const eventActions = document.createElement('div');
						eventActions.classList.add('event-actions');
						
						const viewBtn = document.createElement('button');
						viewBtn.textContent = 'View';
						viewBtn.classList.add('btn', 'btn-secondary');
						viewBtn.addEventListener('click', () => {
								openViewEventModal(event.id);
						});
						
						eventActions.appendChild(viewBtn);
						// eventActions.appendChild(editBtn);
						
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
		console.log(data)
		return data;
	} catch (err) {
		console.error('Fetch error:', err);
		return [];
	}
}

// Initialize the calendar when the page loads
(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    events = await fetchEvents();
    initCalendar();
  })
})();

