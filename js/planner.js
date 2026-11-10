(() => {
  "use strict";

  const STORAGE_KEY = "csc106-planner-tasks-v1";
  const PRIORITIES = ["low", "medium", "high"];
  const FILTERS = {
    all: () => true,
    active: (task) => !task.completed,
    completed: (task) => task.completed,
  };

  const form = document.getElementById("task-form");
  const list = document.getElementById("task-list");
  const titleInput = document.getElementById("task-title");
  const courseInput = document.getElementById("task-course");
  const dueInput = document.getElementById("task-due");
  const priorityInput = document.getElementById("task-priority");
  const titleError = document.getElementById("task-title-error");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const clearCompletedButton = document.getElementById("clear-completed");
  const progressRing = document.getElementById("progress-ring");
  const progressPercent = document.getElementById("progress-percent");
  const progressText = document.getElementById("progress-text");
  const summary = document.getElementById("task-summary");
  const boardSubtitle = document.getElementById("board-subtitle");
  const status = document.getElementById("planner-status");
  const todayLabel = document.getElementById("today-label");

  if (!form || !list) return;

  const CHECK_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>';
  const TRASH_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>';
  const CALENDAR_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>';
  const EMPTY_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';

  let currentFilter = "all";
  let tasks = [];
  let announceTimer = 0;

  const dueFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  });

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toISODate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function shiftedDate(days) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return toISODate(date);
  }

  function parseISODate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parts = value.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    if (
      date.getFullYear() !== parts[0] ||
      date.getMonth() !== parts[1] - 1 ||
      date.getDate() !== parts[2]
    ) {
      return null;
    }
    return date;
  }

  function normalizeTask(raw) {
    if (!raw || typeof raw !== "object") return null;
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    if (!title) return null;

    const id =
      typeof raw.id === "string" && /^[A-Za-z0-9_-]+$/.test(raw.id) ? raw.id : uid();

    return {
      id,
      title: title.slice(0, 90),
      course: typeof raw.course === "string" ? raw.course.trim().slice(0, 24) : "",
      due: parseISODate(raw.due) ? raw.due : "",
      priority: PRIORITIES.includes(raw.priority) ? raw.priority : "medium",
      completed: raw.completed === true,
      createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
    };
  }

  function readTasks() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed.map(normalizeTask).filter(Boolean);
    } catch (error) {
      return null;
    }
  }

  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      /* The planner still works for this session if storage is unavailable. */
    }
  }

  function createSeedTasks() {
    const now = Date.now();
    return [
      {
        id: uid(),
        title: "Polish the planner's empty states",
        course: "CSC 404",
        due: shiftedDate(0),
        priority: "high",
        completed: false,
        createdAt: now - 1000,
      },
      {
        id: uid(),
        title: "Draft the database normalisation report",
        course: "CSC 301",
        due: shiftedDate(3),
        priority: "medium",
        completed: false,
        createdAt: now - 2000,
      },
      {
        id: uid(),
        title: "Read chapter 6: transaction control",
        course: "CSC 301",
        due: shiftedDate(-2),
        priority: "low",
        completed: true,
        createdAt: now - 3000,
      },
    ];
  }

  const storedTasks = readTasks();
  if (storedTasks === null) {
    tasks = createSeedTasks();
    saveTasks();
  } else {
    tasks = storedTasks;
  }

  function announce(message) {
    if (!status) return;
    window.clearTimeout(announceTimer);
    status.textContent = "";
    announceTimer = window.setTimeout(() => {
      status.textContent = message;
    }, 60);
  }

  function getVisibleTasks() {
    return tasks.filter(FILTERS[currentFilter] || FILTERS.all);
  }

  function getCounts() {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      all: tasks.length,
      active: tasks.length - completed,
      completed,
    };
  }

  function getDueInfo(value) {
    const due = parseISODate(value);
    if (!due) return null;

    const today = new Date();
    const dueUtc = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.round((dueUtc - todayUtc) / 86400000);
    const includeYear = due.getFullYear() !== today.getFullYear();
    const formatted = dueFormatter.format(due) + (includeYear ? ` ${due.getFullYear()}` : "");

    if (diff < 0) return { text: `Overdue · ${formatted}`, className: "is-overdue" };
    if (diff === 0) return { text: "Due today", className: "is-today" };
    if (diff === 1) return { text: "Due tomorrow", className: "" };
    return { text: `Due ${formatted}`, className: "" };
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function buildEmptyState(counts) {
    const empty = createElement("li", "empty-state");
    const icon = createElement("span", "empty-icon");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = EMPTY_ICON;

    let heading = "A blank slate";
    let message = "Add your first task using the form. Small steps count double.";

    if (currentFilter === "active" && counts.all > 0) {
      heading = "Nothing left to do";
      message = "Every task is complete. Take a walk — you have earned the quiet.";
    } else if (currentFilter === "completed") {
      heading = "No finished tasks yet";
      message = "Tick something off and it will appear here, ready for a small celebration.";
    }

    empty.append(
      icon,
      createElement("h3", "", heading),
      createElement("p", "", message)
    );
    return empty;
  }

  function buildTask(task) {
    const item = createElement("li", task.completed ? "task task--done" : "task");
    item.dataset.taskId = task.id;

    const checkLabel = createElement("label", "task-check");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      `${task.completed ? "Mark as not complete" : "Mark as complete"}: ${task.title}`
    );
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const checkBox = createElement("span", "task-check-box");
    checkBox.setAttribute("aria-hidden", "true");
    checkBox.innerHTML = CHECK_ICON;
    checkLabel.append(checkbox, checkBox);

    const content = createElement("div", "task-content");
    const heading = createElement("h3", "task-title", task.title);
    const meta = createElement("div", "task-meta");

    if (task.course) {
      meta.appendChild(createElement("span", "task-course", task.course));
    }

    const due = task.due ? getDueInfo(task.due) : null;
    if (due) {
      const dueNode = createElement("span", `task-due ${due.className}`.trim());
      dueNode.innerHTML = CALENDAR_ICON;
      dueNode.appendChild(document.createTextNode(due.text));
      meta.appendChild(dueNode);
    }

    const priority = createElement(
      "span",
      `priority priority--${task.priority}`,
      task.priority
    );
    meta.appendChild(priority);

    content.append(heading, meta);

    const deleteButton = createElement("button", "task-delete");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.title}`);
    deleteButton.innerHTML = TRASH_ICON;
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkLabel, content, deleteButton);
    return item;
  }

  function updateSummary(counts) {
    const total = counts.all;
    const percent = total === 0 ? 0 : Math.round((counts.completed / total) * 100);

    if (progressRing) {
      progressRing.style.setProperty("--progress", String(percent));
    }
    if (progressPercent) {
      progressPercent.textContent = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${counts.completed} of ${total}`;
    }
    if (clearCompletedButton) {
      clearCompletedButton.disabled = counts.completed === 0;
    }
    if (summary) {
      summary.textContent =
        total === 0
          ? "Nothing on the list yet"
          : `${counts.active} active · ${counts.completed} completed`;
    }
    if (boardSubtitle) {
      if (total === 0) {
        boardSubtitle.textContent = "A blank page is a fine place to start.";
      } else if (counts.active === 0) {
        boardSubtitle.textContent = "Everything is wrapped up. Enjoy the quiet.";
      } else {
        boardSubtitle.textContent = `${counts.active} ${
          counts.active === 1 ? "task" : "tasks"
        } left to finish.`;
      }
    }
  }

  function updateFilters(counts) {
    filterButtons.forEach((button) => {
      const filter = button.dataset.filter;
      button.setAttribute("aria-pressed", String(filter === currentFilter));
      const counter = button.querySelector(`[data-count="${filter}"]`);
      if (counter) counter.textContent = String(counts[filter]);
    });
  }

  function render() {
    const counts = getCounts();
    const visible = getVisibleTasks();

    list.replaceChildren();
    if (visible.length === 0) {
      list.appendChild(buildEmptyState(counts));
    } else {
      visible.forEach((task) => list.appendChild(buildTask(task)));
    }

    updateSummary(counts);
    updateFilters(counts);
  }

  function findTaskCheckbox(id) {
    return list.querySelector(`[data-task-id="${id}"] input[type="checkbox"]`);
  }

  function findTaskDelete(id) {
    return list.querySelector(`[data-task-id="${id}"] .task-delete`);
  }

  function focusFilterButton() {
    const button = filterButtons.find((item) => item.dataset.filter === currentFilter);
    if (button) button.focus({ preventScroll: true });
  }

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    task.completed = !task.completed;
    const hiddenFromView =
      (currentFilter === "active" && task.completed) ||
      (currentFilter === "completed" && !task.completed);

    saveTasks();
    render();
    announce(`${task.title} marked ${task.completed ? "complete" : "active"}.`);

    if (hiddenFromView) {
      focusFilterButton();
    } else {
      const checkbox = findTaskCheckbox(task.id);
      if (checkbox) checkbox.focus({ preventScroll: true });
    }
  }

  function deleteTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const visibleBefore = getVisibleTasks();
    const visibleIndex = visibleBefore.findIndex((item) => item.id === id);

    tasks = tasks.filter((item) => item.id !== id);
    saveTasks();
    render();
    announce(`Deleted "${task.title}".`);

    const visibleAfter = getVisibleTasks();
    if (visibleAfter.length > 0) {
      const next = visibleAfter[Math.min(Math.max(visibleIndex, 0), visibleAfter.length - 1)];
      const deleteButton = findTaskDelete(next.id);
      if (deleteButton) deleteButton.focus({ preventScroll: true });
    } else if (currentFilter !== "all") {
      focusFilterButton();
    } else {
      titleInput.focus();
    }
  }

  function setTitleError(message) {
    titleError.textContent = message;
    titleInput.setAttribute("aria-invalid", message ? "true" : "false");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim().replace(/\s+/g, " ");
    if (!title) {
      setTitleError("Give the task a name before adding it.");
      titleInput.focus();
      announce("Please add a task title.");
      return;
    }

    setTitleError("");

    const task = {
      id: uid(),
      title: title.slice(0, 90),
      course: courseInput.value.trim().slice(0, 24),
      due: parseISODate(dueInput.value) ? dueInput.value : "",
      priority: PRIORITIES.includes(priorityInput.value) ? priorityInput.value : "medium",
      completed: false,
      createdAt: Date.now(),
    };

    tasks.unshift(task);
    saveTasks();

    if (currentFilter !== "all") currentFilter = "all";
    form.reset();
    priorityInput.value = "medium";
    render();
    titleInput.focus();
    announce(`Task added: ${task.title}.`);
  });

  titleInput.addEventListener("input", () => {
    if (titleInput.getAttribute("aria-invalid") === "true") {
      setTitleError("");
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      if (!FILTERS[filter] || filter === currentFilter) return;
      currentFilter = filter;
      render();
      announce(
        filter === "all"
          ? "Showing all tasks."
          : `Showing ${filter} tasks: ${getVisibleTasks().length}.`
      );
    });
  });

  if (clearCompletedButton) {
    clearCompletedButton.addEventListener("click", () => {
      const completedCount = tasks.filter((task) => task.completed).length;
      if (completedCount === 0) return;

      tasks = tasks.filter((task) => !task.completed);
      saveTasks();

      if (currentFilter === "completed") currentFilter = "all";
      render();
      focusFilterButton();
      announce(
        `${completedCount} completed ${completedCount === 1 ? "task" : "tasks"} cleared.`
      );
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const updated = readTasks();
    if (updated === null) return;
    tasks = updated;
    render();
    announce("Planner updated in another tab.");
  });

  if (todayLabel) {
    todayLabel.textContent = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date());
  }

  render();
})();
