
(function () {
    function extractCourses() {
        let courses = [];
        document.querySelectorAll(".cmp-mycourses_list-row-lg").forEach(row => {
            let course = {
                code: row.querySelector(".cmp-mycourses_code-value a")?.innerText.trim() || "N/A",
                title: row.querySelector(".cmp-mycourses_title-value a")?.innerText.trim() || "N/A",
                status: row.querySelector(".cmp-mycourses_list-header-status a span")?.innerText.trim() || "N/A",
                date: row.querySelector(".cmp-mycourses_date-value a")?.innerText.trim() || "N/A",
                grade: row.querySelector(".cmp-mycourses_grade-value a")?.innerText.trim() || "N/A",
                certificateLink: row.querySelector("a[href*='my-certificates']")?.href || "#"
            };
            courses.push(course);
        });

        chrome.storage.local.set({ "completedCourses": courses });
    }

    extractCourses();
})();
