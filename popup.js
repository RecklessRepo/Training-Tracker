
const trainingRequirements = [
  {
    "training": "Level I AT Awareness Training",
    "frequency": "CY",
    "grade": "All",
    "course_code": "JATLV10000"
  },
  {
    "training": "Annual Cyber Awareness/ PII Training",
    "frequency": "FY",
    "grade": "All",
    "course_code": "CYBERM0000"
  },
  {
    "training": "Risk Management",
    "frequency": "Every 2 CY",
    "grade": "All",
    "course_code": "SDRMGTSUL0"
  },
  {
    "training": "Marine Corps Operations Security (OPSEC)",
    "frequency": "CY",
    "grade": "All",
    "course_code": "MCBQINTRO0"
  },
  {
    "training": "Intel Oversight",
    "frequency": "Every 12 Months",
    "grade": "All",
    "course_code": "INTELAO001"
  },
  {
    "training": "Risk Management",
    "frequency": "Every 2 CY",
    "grade": "E1-E3",
    "course_code": "SDRMGTE130"
  },
  {
    "training": "Risk Management",
    "frequency": "Every 2 CY",
    "grade": "(E4-E6, WO1-CWO2, O1-O3)",
    "course_code": "SDRMGTSUL0"
  },
  {
    "training": "Risk Management",
    "frequency": "Every 2 CY",
    "grade": "(E7-E9, CWO3-CWO5, O4-O10)",
    "course_code": "SDRMGTSEN0"
  },
  {
    "training": "Counter Intel",
    "frequency": "Every 2 FY",
    "grade": "All",
    "course_code": "CI11616000"
  },
  {
    "training": "Supervisor Safety",
    "frequency": "Every 12 Months",
    "grade": "All",
    "course_code": "SUPSFTY001"
  },
  {
    "training": "Records Management",
    "frequency": "FY",
    "grade": "All",
    "course_code": "M01RMT0700"
  }
];

function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.match(/\d{2}\/\d{2}\/\d{4}/);
  return parts ? new Date(parts[0]) : null;
}

function calculateDeadline(frequency, completedDate) {
  const now = new Date();
  let deadline;

  if (!completedDate) {
    if (frequency === "CY") {
      deadline = new Date(now.getFullYear(), 11, 31);
    } else if (frequency === "FY") {
      deadline = new Date(now.getMonth() < 9 ? now.getFullYear() : now.getFullYear() + 1, 8, 30);
    } else if (frequency === "Every 12 Months") {
      deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 30);  // Placeholder for warning window
    } else if (frequency === "Every 2 CY") {
      deadline = new Date(now.getFullYear(), 11, 31);
    } else if (frequency === "Every 2 FY") {
      deadline = new Date(now.getMonth() < 9 ? now.getFullYear() + 1 : now.getFullYear() + 2, 8, 30);
    }
    return deadline;
  }

  if (frequency === "CY") {
    deadline = new Date(completedDate.getFullYear(), 11, 31);
  } else if (frequency === "FY") {
    const fy = completedDate.getMonth() >= 9 ? completedDate.getFullYear() + 1 : completedDate.getFullYear();
    deadline = new Date(fy, 8, 30);
  } else if (frequency === "Every 12 Months") {
    deadline = new Date(completedDate);
    deadline.setFullYear(deadline.getFullYear() + 1);
  } else if (frequency === "Every 2 CY") {
    deadline = new Date(completedDate.getFullYear() + 2, 11, 31);
  } else if (frequency === "Every 2 FY") {
    const fy = completedDate.getMonth() >= 9 ? completedDate.getFullYear() + 1 : completedDate.getFullYear();
    deadline = new Date(fy + 1, 8, 30);
  }

  return deadline;
}

function isCourseValid(course, frequency) {
  const completedDate = parseDate(course.date);
  if (!completedDate) return false;

  const deadline = calculateDeadline(frequency, completedDate);
  return deadline >= new Date();
}

chrome.storage.local.get(["completedCourses", "userGrade"], (data) => {
  const container = document.getElementById("training-status");
  const userGrade = data.userGrade || "N/A";
  const completedCourses = data.completedCourses || [];

  document.getElementById("user-grade").innerText = "Grade: " + userGrade;
  container.innerHTML = "";

  trainingRequirements.forEach(req => {
    if (req.grade !== "All" && req.grade !== userGrade) return;

    const course = completedCourses.find(c => c.code === req.course_code);
    const completedDate = course ? parseDate(course.date) : null;
    const deadline = calculateDeadline(req.frequency, completedDate);
    const valid = course && isCourseValid(course, req.frequency);

    const div = document.createElement("div");
    
    div.className = "course-item";
    const daysUntilDeadline = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
    if (daysUntilDeadline !== null && daysUntilDeadline <= 45 && valid) {
        div.classList.add("expiring");
    }
    

    let status = "&#x274C; Incomplete";
    let certLink = "";
    if (course && valid) {
      status = "&#x2705; Complete";
      if (course.certificateLink && course.certificateLink !== "#") {
        certLink = `<br><a href="${course.certificateLink}" target="_blank">View Certificate</a>`;
      }
    }

    div.innerHTML = `
      <strong>${req.training}</strong><br>
      Status: ${status}<br>
      Deadline: ${deadline ? deadline.toLocaleDateString() : "N/A"}<br>
      ${course ? `Last Completed: ${course.date}` : ""}
      ${certLink}
    `;
    container.appendChild(div);
  });
});


document.getElementById("filter-select").addEventListener("change", function () {
  const selected = this.value;
  const items = document.querySelectorAll(".course-item");
  items.forEach(item => {
    item.style.display = "block";
    if (selected === "done" && !item.innerHTML.includes("&#x2705;")) {
      item.style.display = "none";
    } else if (selected === "notdone" && !item.innerHTML.includes("&#x274C;")) {
      item.style.display = "none";
    } else if (selected === "expiring" && !item.classList.contains("expiring")) {
      item.style.display = "none";
    }
  });
});
