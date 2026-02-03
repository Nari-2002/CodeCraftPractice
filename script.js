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

  course.topics.forEach((topic) => {
    const topicCard = document.createElement("div");
    topicCard.className = "topic-card";

    const questionsList = topic.questions
      .map((question) => `<li>${question}</li>`)
      .join("");

    topicCard.innerHTML = `
      <h4>${topic.name}</h4>
      <ul>${questionsList}</ul>
    `;

    topicsContainer.appendChild(topicCard);
  });

  coursesSection.classList.add("hidden");
  detailsSection.classList.remove("hidden");
  backButton.classList.remove("hidden");
  detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
};

const showCourses = () => {
  detailsSection.classList.add("hidden");
  coursesSection.classList.remove("hidden");
  backButton.classList.add("hidden");
  coursesSection.scrollIntoView({ behavior: "smooth", block: "start" });
};

backButton.addEventListener("click", showCourses);

fetch("courses.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load courses.json");
    }
    return response.json();
  })
  .then((data) => {
    coursesData = data.courses;
    renderCourses(coursesData);
    updateStats(coursesData);
  })
  .catch(() => {
    coursesGrid.innerHTML = "<p>Unable to load courses. Please try again later.</p>";
  });
