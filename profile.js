
(function () {
    function extractGrade() {
        let gradeValue = "N/A";
        const dtElements = document.querySelectorAll("dt");

        dtElements.forEach(dt => {
            if (dt.textContent.trim() === "Grade") {
                const dd = dt.nextElementSibling;
                if (dd && dd.tagName.toLowerCase() === "dd") {
                    gradeValue = dd.textContent.trim();
                }
            }
        });

        chrome.storage.local.set({ "userGrade": gradeValue });
    }

    extractGrade();
})();
