let calendarInstance;


window.addEventListener("click", (e) => {
  if (e.target.id === "taskModal") {
    document.getElementById("taskModal").style.display = "none";
  }
});
const calendarDrawer = document.getElementById("calendarDrawer");
const calendarViewBtn = document.getElementById("calendarViewBtn");
const closeCalendar = document.getElementById("closeCalendar");

calendarViewBtn.addEventListener("click", () => {
  calendarDrawer.classList.add("open");
  // contain=document.querySelector('.container')
  // console.log('contaoner',contain)
  // contain.style.marginTop = "0";
  // contain.style.marginRight = "auto";
  // contain.style.marginBottom = "0";
  // contain.style.marginLeft = "0";


  setTimeout(() => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    loadCalendar(tasks);
  }, 300);
});

closeCalendar.addEventListener("click", () => {
  calendarDrawer.classList.remove("open");
});

function loadCalendar(tasks) {
  const calendarEl = document.getElementById("calendar");

  const events = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: task.id,
      title: `${task.isRecurring ? '🔁 ' : ''}${task.title}`,
      start: task.dueDate,
      allDay: false,
      backgroundColor: task.isCompleted ? "#5cb85c" : "#f0ad4e",
      borderColor: "#333",
      textColor: "#000",
      extendedProps: {
        isRecurring: task.isRecurring,
        status: task.isCompleted ? "Completed" : "Pending"
      }
    }));
    document.querySelector(".close-modal").addEventListener("click", () => {
      document.getElementById("taskModal").style.display = "none";
    });
  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(events);
    calendarInstance.render();
  } else {
    calendarInstance = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: 600,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay"
      },
      events: events,
      eventClick: function(info) {
        const start = info.event.start;
      
        const formattedTime = start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          meridiem:'short',
          hour12: true
        });

      
        const formattedDate = start.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      
        // Set modal content
        document.getElementById("modalTitle").textContent = `${info.event.title}`;
        // document.getElementById("modalDue").innerHTML = `<p id="modalDuetime"><i class="fa-solid fa-clock"></i>${formattedTime}</p>`;/
        document.getElementById("modalDuedate").innerHTML = `<p id="modalDuedate"><i class="fa fa-calendar" ></i>     ${formattedDate}</p> `;
        document.getElementById("modalDuetime").innerHTML = `<p id="modalDuetime"><i class="fa-solid fa-clock"></i>    ${formattedTime}</p>`
        // Show modal
        document.getElementById("taskModal").style.display = "block";
      }
  
    });
    calendarInstance.render();

  }
}

// Call this after adding, editing, or deleting any task
function refreshCalendarFromStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  loadCalendar(tasks);
}

// Example: Use this in your task submit logic
// refreshCalendarFromStorage();




let currentFilter = localStorage.getItem("selectedTab") || "active"; 
function sendEmailReminder(taskTitle, dueTime) {
  emailjs.send("service_dlwytxx", "template_djj3uq5", {
    task_title: taskTitle,
    due_time: dueTime,
    to_email: "anish.kamath2005@gmail.com" // Replace with actual recipient or a stored user email
  })
  .then(() => {
    console.log(`✅ Email reminder sent for "${taskTitle}"`);
  })
  .catch((error) => {
    console.error("❌ Failed to send reminder email", error);
  });
}

function saveTaskOrder() {
  const taskElements = document.querySelectorAll(".circleboxcontainer");
  const idsInOrder = Array.from(taskElements).map(el => el.dataset.id);

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const reordered = idsInOrder.map(id => tasks.find(t => t.id === id));
  
  localStorage.setItem("tasks", JSON.stringify(reordered));
}

function updateProgressBar() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const completed = tasks.filter(task => task.isCompleted).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const progressBar = document.querySelector(".inner-progress");
  const progressText = document.querySelector(".progress-text");

  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}% Completed`;

  if(percent==0){
  progressText.style.color='red'
  }
  else{
    progressText.style.color='black'
  }
}

function fetchactivetasks(filter){
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.isCompleted;
    if (filter=== "completed") return task.isCompleted;
    return true; // "all"
  });
  filteredTasks.forEach(task => renderTask(task));
  updateProgressBar(); 
}


window.addEventListener("DOMContentLoaded", () => {
  function autoGenerateRecurringTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let changed = false;
    console.log('tasks as fetched',tasks)
    const updatedTasks = tasks.flatMap(task => {
      if (task.isRecurring && !task.isCompleted && task.dueDate) {
        const due = new Date(task.dueDate);
        const now = new Date();
        if (due < now) {
          changed = true;
          return handleRecurringTaskCompletion(task);
        }
      }
      return [task];
    });
  
    if (changed) {
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      fetchactivetasks(currentFilter);
    }
  }
  
  // Run this once on load
  autoGenerateRecurringTasks();
  
  // Or, optionally run every few minutes
  setInterval(autoGenerateRecurringTasks, 60000);

  // setInterval(() => {
  //   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  //   let updated = false;
  //   const newTasks = [];
  
  //   tasks.forEach((task) => {
  //     const container = document.querySelector(`.circleboxcontainer[data-id='${task.id}']`);
  //     if (container) {
  //       const dueText = container.querySelector(".due-text");
  //       if (dueText) checkAndMarkOverdue(task, dueText);
  //     }
  
  //     // 💡 Auto-create next instance for overdue recurring tasks
  //     if (
  //       task.isRecurring &&
  //       !task.isCompleted &&
  //       task.dueDate &&
  //       new Date(task.dueDate) < new Date()
  //     ) {
  //       // Mark current as completed
  //       task.isCompleted = true;
  
  //       // Create new version
  //       const nextDue = new Date(task.dueDate);
  //       nextDue.setDate(nextDue.getDate() + 7);
  //       const newTask = {
  //         ...task,
  //         id: Date.now().toString() + Math.random().toString(36).slice(2),
  //         isCompleted: false,
  //         dueDate: nextDue.toISOString()
  //       };
  
  //       newTasks.push(newTask);
  //       updated = true;
  //     }
  //   });
  
  //   if (updated) {
  //     const combinedTasks = [...tasks, ...newTasks];
  //     localStorage.setItem("tasks", JSON.stringify(combinedTasks));
  //     fetchactivetasks(currentFilter); // 🔁 Update UI
  //   }
  // }, 30000);
  
  
  
  updateProgressBar(); 
  fetchactivetasks(currentFilter)
  const taskInput = document.querySelector(".taskinput");
  const voiceInputBtn = document.getElementById("voiceInputBtn");

  let isListening = false;
  let manuallyStopped = false;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      manuallyStopped = false;
      voiceInputBtn.classList.add("listening");
    };

    recognition.onresult = (event) => {
      if (!manuallyStopped) {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          taskInput.value = transcript;
        }
      }
    };

    recognition.onend = () => {
      isListening = false;
      voiceInputBtn.classList.remove("listening");
    };

    voiceInputBtn.addEventListener("click", () => {
      if (!isListening) {
        recognition.start();
      } else {
        manuallyStopped = true;
        recognition.stop();
      }
    });
  } else {
    alert("Your browser doesn't support speech recognition.");
  }

  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  // savedTasks.forEach((task) => renderTask(task));

  // 🔁 Periodically check overdue
  setInterval(() => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      const container = document.querySelector(`.circleboxcontainer[data-id='${task.id}']`);
      if (container) {
        const dueText = container.querySelector(".due-text");
        if (dueText) checkAndMarkOverdue(task, dueText);
      }
    });
  }, 30000);

  new Sortable(document.getElementById("taskList"), {
    animation: 150,
    ghostClass: "sortable-ghost",
    onEnd: () => {
      saveTaskOrder();
    }
  });
});


// implementing active and completed functionality

// console.log('tab element', document.getElementById('#activetab'))


activetab=document.getElementById('activetab')
completedtab=document.getElementById('completedtab')

activetab.addEventListener('click', () => {

function fetchactivetasks(filter){
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.isCompleted;
    if (filter=== "completed") return task.isCompleted;
    return true; // "all"
  });

  filteredTasks.forEach(task => renderTask(task));
  updateProgressBar(); 
}
  if (!activetab.classList.contains('active')) {
    activetab.classList.add('active');
    completedtab.classList.remove('active');
    fetchactivetasks('active')
  }
});

completedtab.addEventListener('click', () => {

  function fetchactivetasks(filter){
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
  
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    const filteredTasks = tasks.filter(task => {
      if (filter === "active") return !task.isCompleted;
      if (filter=== "completed") return task.isCompleted;
      return true; // "all"
    });
    filteredTasks.forEach(task => renderTask(task));
    updateProgressBar(); 
  }
  if (!completedtab.classList.contains('active')) {
    completedtab.classList.add('active');
    activetab.classList.remove('active');
    fetchactivetasks('completed')
  }
});





document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const taskInput = document.querySelector(".taskinput");
  const taskTitle = taskInput.value.trim();
  if (!taskTitle) return;

  const deadlineInput = document.getElementById("deadlineInput");
  const dueDate = deadlineInput?.value || "";
  const isRecurring = document.querySelector(".recurring-checkbox")?.checked || false;
 console.log('at time of submitting code is it recurring',isRecurring)
  const task = {
    id: Date.now().toString(),
    title: taskTitle,
    dueDate: dueDate,
    isRecurring: isRecurring,
    isCompleted: false,
    emailNotified: false
    

  };
  console.log('check whether recurring ot not',task.isRecurring)

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTask(task);
  updateProgressBar(); 
  taskInput.value = "";
});

function renderTask(task) {
  const taskList = document.getElementById("taskList");
  const container = document.createElement("div");
  container.className = "circleboxcontainer";
  container.dataset.id = task.id;

  const circle = document.createElement("div");
  circle.className = "completedcircle";

  const taskText = document.createElement("div");
  taskText.className = "todoelement";

  if (task.isCompleted) {
    circle.classList.add("completed");
    taskText.classList.add("completed");
  }


  circle.addEventListener("click", () => {
    console.log('atleast entered click')
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
  
    const updatedTasks = tasks.flatMap(t => {
      console.log('t is recurring or not', t.isRecurring)
      if (t.id === task.id) {
        if (t.id === task.id && t.isRecurring && !t.isCompleted &&t.dueDate)
          {
          console.log('entered recurring bracket')
          return handleRecurringTaskCompletion(t);
        } else {
          t.isCompleted = !t.isCompleted;
        }
      }
      return [t];
    });
  
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    
    // Refresh the task view to reflect changes
    const activeTab = document.querySelector(".tab.active");
    const filter = activeTab?.id === "completedtab" ? "completed" :
                   activeTab?.id === "activetab" ? "active" : "all";
    fetchactivetasks(filter);
  });
  
  

  const title = document.createElement("div");
  title.textContent = task.title;
  taskText.appendChild(title);

  const dueText = document.createElement("div");
  dueText.className = "due-text on-time";
  // dueText.className='due-text on-time';
  dueText.textContent='No due-date yet! Set a new one!'
 // dueText.textContent='Overdue!'
  checkAndMarkOverdue(task, dueText);
  taskText.appendChild(dueText);

  const errorText = document.createElement("div");
  errorText.className = "error-text";
  errorText.textContent = "Task deadline cannot be before current date time! Please set another date time.";
  taskText.appendChild(errorText);

  const editDiv = document.createElement("div");
  editDiv.className = "edit";

  const calendarIcon = document.createElement("i");
  calendarIcon.className = "fa-regular fa-calendar-days fa-2x calendar-icon";

  const deadlineInput = document.createElement("input");
  deadlineInput.type = "datetime-local";
  deadlineInput.className = "hidden-deadline";
  deadlineInput.value = task.dueDate || "";

  calendarIcon.addEventListener("click", () => {
    deadlineInput.showPicker();
  });

  // deadlineInput.addEventListener("change", () => {
  //   if (deadlineInput.value) {
  //     const date = new Date(deadlineInput.value);
  //     const currentdate = new Date();

  //     if (date > currentdate) {
  //       checkAndMarkOverdue(task, dueText);
  //       dueText.textContent = `Due: ${date.toLocaleString(undefined, {
  //         month: "short",
  //         day: "numeric",
  //         year: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit"
  //       })}`;
  //       errorText.style.display = "none";
  //     } else {
  //       errorText.style.display = "block";
  //     }

  //     const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  //     const updatedTasks = tasks.map((t) => {
  //       if (t.id === task.id) t.dueDate = deadlineInput.value;
  //       return t;
  //     });
  //     localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  //   }
  // });

  function handleRecurringTaskCompletion(task) {
    console.log('entered here in next week version');
  
    const nextWeekDate = new Date(task.dueDate);
    if (isNaN(nextWeekDate.getTime())) {
      console.warn("❌ Invalid due date for recurring task:", task);
      return [{ ...task, isCompleted: true }];
    }
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  
    return [
      { ...task, isCompleted: true }, // mark current one as done
      {
        ...task,
        id: Date.now().toString(), // new ID!
        dueDate: nextWeekDate.toISOString(),
        isCompleted: false
      }
    ];
  }
  
  deadlineInput.addEventListener("change", () => {
    if (deadlineInput.value) {
      const selectedDate = new Date(deadlineInput.value);
      const now = new Date();
  
      if (selectedDate > now) {
        task.dueDate = deadlineInput.value;
  
        // ✅ Save updated dueDate to localStorage
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.map(t => {
          if (t.id === task.id) t.dueDate = deadlineInput.value;
          return t;
        });
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  
        // ✅ Immediately update the UI (including text & color class)
        checkAndMarkOverdue(task, dueText);
        errorText.style.display = 'none';
  
      } else {
        //  Deadline is in the past — show error
        errorText.style.display = 'block';
      }
    }
  });

  const recurringToggle = document.createElement("div");
  recurringToggle.className = "recurring-toggle";
  recurringToggle.innerHTML = `
    <label class="switch">
      <input type="checkbox" class="recurring-checkbox" ${task.isRecurring ? "checked" : ""}>
      <span class="slider round"></span>
    </label>
    <span class="recurring-label"> Recurring?</span>
  `;
 



  const pencilIcon = document.createElement("i");
  pencilIcon.className = "fa-solid fa-pencil fa-3x";
  pencilIcon.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.title;
    input.className = "edit-title";
    taskText.replaceChild(input, title);
    input.focus();

    input.addEventListener("blur", () => {
      const newTitle = input.value.trim();
      if (newTitle) {
        title.textContent = newTitle;
        task.title = newTitle;
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.map((t) => {
          if (t.id === task.id) t.title = newTitle;
          return t;
        });
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      }
      taskText.replaceChild(title, input);
    });
    input.addEventListener('keydown',(e)=>{
      if (e.key=='Enter'){
        e.preventDefault();
        input.blur();
      }
    })
  });

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa-solid fa-xmark fa-3x";
  deleteIcon.style.color = "black";
  deleteIcon.addEventListener("click", () => {
    container.remove();
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter((t) => t.id !== task.id);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  });
  updateProgressBar(); 

  editDiv.appendChild(calendarIcon);
  editDiv.appendChild(deadlineInput);
  editDiv.appendChild(recurringToggle);
  editDiv.appendChild(pencilIcon);
  editDiv.appendChild(deleteIcon);

  container.appendChild(circle);
  container.appendChild(taskText);
  container.appendChild(editDiv);

  taskList.appendChild(container);




    const recurringCheckbox = container.querySelector(".recurring-checkbox");

  recurringCheckbox.addEventListener("change", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
        t.isRecurring = recurringCheckbox.checked;
      }
      return t;
    });
    // console.log(localStorage.getItem(tasks))
    console.log(tasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  });
}



function checkAndMarkOverdue(task, dueTextElement) {
  if (task.dueDate && !task.isCompleted) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;
    const oneDay = 24 * 60 * 60 * 1000;

    dueTextElement.classList.remove("overdue", "warning", "on-time");

    if (timeDiff < 0) {
      dueTextElement.textContent = "⚠ Overdue";
      // dueTextElement.textContent="Check";
      dueTextElement.classList.add("overdue");
    } else if (timeDiff <= oneDay) {
      dueTextElement.textContent = `⚠ Due Soon: ${dueDate.toLocaleString()}`;
      dueTextElement.classList.add("warning");

      // ✅ NEW: Email reminder logic
      const oneHour = 60 * 60 * 1000;
      if (timeDiff <= oneHour && !task.emailNotified) {
        // sendEmailReminder(task.title, dueDate.toLocaleString());
        console.log('sent email')
        // Update task to prevent repeat email
        task.emailNotified = true;
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, emailNotified: true } : t);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      }
    } else {
      dueTextElement.textContent = `Due: ${dueDate.toLocaleString()}`;
      dueTextElement.classList.add("on-time");
    }
  }
}







