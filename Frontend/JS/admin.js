

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
  document.getElementById('eventId').value = e.target.dataset.id;
  document.getElementById('eventTitle').value = e.target.dataset.title;
  document.getElementById('eventDate').value = e.target.dataset.date;
  document.getElementById('startTime').value = e.target.dataset.starttime;
  document.getElementById('endTime').value = e.target.dataset.endtime;
  document.getElementById('eventLocation').value = e.target.dataset.location;
  document.getElementById('eventDescription').value = e.target.dataset.description;
  
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
    `;
    const approveBtn = document.createElement('button');
    approveBtn.textContent = 'Approve';
    approveBtn.dataset.id = event.id;
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

fetchlist();

