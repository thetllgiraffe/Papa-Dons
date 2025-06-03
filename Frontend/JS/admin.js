
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
  data.forEach(event => {
    if (event.status === 'pending') {
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

    table.appendChild(row);
    } else if (event.status === 'approved') {
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

document.getElementById("weekly-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const schedule = {};
  const dayBlocks = document.querySelectorAll(".day-block");

  dayBlocks.forEach(dayBlock => {
    const day = dayBlock.dataset.day;
    const starts = [...dayBlock.querySelectorAll('input[name="start"]')];
    const ends = [...dayBlock.querySelectorAll('input[name="end"]')];

    const intervals = starts.map((startInput, index) => {
      const start = startInput.value;
      const end = ends[index]?.value;
      if (start && end) {
        return { start, end };
      }
      return null;
    }).filter(Boolean);

    schedule[day] = intervals;
    console.log(schedule)
  });

  // POST JSON to backend
  fetch("/admin/schedule/weekly", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule)
  })
  .then(res => res.json())
  .then(data => {
    console.log("Saved:", data);
  });
});

document.querySelectorAll('.add-interval').forEach(button => {
  button.addEventListener('click', () => {
    const dayDiv = button.closest('.day-block');
    console.log(dayDiv);
    const day = dayDiv.dataset.day;
    const container = dayDiv.querySelector('.intervals');

    const interval = document.createElement('div');
    interval.classList.add('interval');
    interval.innerHTML = `
      <label>Start: <input type="time" name="start"></label>
      <label>End: <input type="time" name="end"></label>
    `;
    container.appendChild(interval);
  });
});

  


fetchlist();

