const coursesGrid = document.getElementById("coursesGrid");
const detailsSection = document.getElementById("detailsSection");
const coursesSection = document.getElementById("coursesSection");
const topicsContainer = document.getElementById("topicsContainer");
const detailsTitle = document.getElementById("detailsTitle");
const detailsSubtitle = document.getElementById("detailsSubtitle");
const backButton = document.getElementById("backButton");
const courseCount = document.getElementById("courseCount");
const topicCount = document.getElementById("topicCount");
const questionCount = document.getElementById("questionCount");

let coursesData = [];

const updateStats = (courses) => {
  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0);
  const totalQuestions = courses.reduce((sum, course) => {
    return sum + course.topics.reduce((topicSum, topic) => topicSum + topic.questions.length, 0);
  }, 0);

  courseCount.textContent = courses.length;
  topicCount.textContent = totalTopics;
  questionCount.textContent = totalQuestions;
};

const renderCourses = (courses) => {
  coursesGrid.innerHTML = "";

  courses.forEach((course, index) => {
    const card = document.createElement("article");
    card.className = "course-card";
    card.setAttribute("data-index", index);

    card.innerHTML = `
      <h4>${course.name}</h4>
      <p>${course.description}</p>
      <button class="primary-button" type="button">View Questions</button>
    `;

    card.addEventListener("click", (event) => {
      if (event.target.tagName === "BUTTON" || event.currentTarget === card) {
        showCourseDetails(course);
      }
    });

    coursesGrid.appendChild(card);
  });
};

const showCourseDetails = (course) => {
  detailsTitle.textContent = `${course.name} Practice Topics`;
  detailsSubtitle.textContent = course.description;
  topicsContainer.innerHTML = "";

  course.topics.forEach((topic, index) => {
    const topicCard = document.createElement("div");
    topicCard.className = "topic-card";

    const questionsList = topic.questions
      .map((q) => `<li>${q}</li>`)
      .join("");

    topicCard.innerHTML = `
      <div class="topic-header" data-index="${index}" role="button" tabindex="0" aria-expanded="false">
        <h4>${topic.name}</h4>
        <span class="toggle-icon">+</span>
      </div>
      <ul class="topic-questions">
        ${questionsList}
      </ul>
    `;

    topicsContainer.appendChild(topicCard);
  });

  // Accordion behavior
  const headers = topicsContainer.querySelectorAll(".topic-header");

  const toggleAccordion = (header) => {
    const currentQuestions = header.nextElementSibling;
    const icon = header.querySelector(".toggle-icon");

    // Close all others
    document.querySelectorAll(".topic-questions").forEach((q) => {
      if (q !== currentQuestions) q.classList.remove("is-open");
    });

    document.querySelectorAll(".topic-header").forEach((h) => {
      if (h !== header) h.setAttribute("aria-expanded", "false");
    });

    document.querySelectorAll(".toggle-icon").forEach((i) => {
      if (i !== icon) i.textContent = "+";
    });

    // Toggle current
    const isOpen = currentQuestions.classList.toggle("is-open");
    header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    icon.textContent = isOpen ? "−" : "+";
  };

  headers.forEach((header) => {
    header.addEventListener("click", () => toggleAccordion(header));
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleAccordion(header);
      }
    });
  });

  coursesSection.classList.add("hidden");
  detailsSection.classList.remove("hidden");
  backButton.classList.remove("hidden");
  detailsSection.scrollIntoView({ behavior: "smooth" });
};

const showCourses = () => {
  detailsSection.classList.add("hidden");
  coursesSection.classList.remove("hidden");
  backButton.classList.add("hidden");
  coursesSection.scrollIntoView({ behavior: "smooth", block: "start" });
};

backButton.addEventListener("click", showCourses);

const loadCourses = async () => {
  try {
    const manifestResponse = await fetch("courses/manifest.json");
    if (!manifestResponse.ok) {
      throw new Error("Failed to load manifest.json");
    }
    const manifest = await manifestResponse.json();
    if (!manifest || !Array.isArray(manifest.files)) {
      throw new Error("Invalid manifest format");
    }

    const responses = await Promise.all(
      manifest.files.map((file) => fetch(`courses/${file}`))
    );

    responses.forEach((response) => {
      if (!response.ok) {
        throw new Error("Failed to load a course file");
      }
    });

    return Promise.all(responses.map((response) => response.json()));
  } catch (error) {
    const response = await fetch("courses.json");
    if (!response.ok) {
      throw new Error("Failed to load courses.json");
    }
    const data = await response.json();
    return Array.isArray(data.courses) ? data.courses : [];
  }
};

loadCourses()
  .then((courses) => {
    coursesData = courses;
    renderCourses(coursesData);
    updateStats(coursesData);
  })
  .catch(() => {
    coursesGrid.innerHTML = "<p>Unable to load courses. Please try again later.</p>";
  });
