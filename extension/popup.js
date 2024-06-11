document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("button");

    btn.addEventListener("click", async function() {
        const startInput = document.getElementById("start").value;
        const endInput = document.getElementById("end").value;

        btn.disabled = true;
        btn.innerText = "Summarizing...";

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url;

        fetch(`http://127.0.0.1:5000/summary?url=${encodeURIComponent(url)}&start=${encodeURIComponent(startInput)}&end=${encodeURIComponent(endInput)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("output").innerText = data.summary;
                btn.disabled = false;
                btn.innerText = "Summarize";
            })
            .catch(error => {
                console.error('Error during summarization:', error);
                btn.disabled = false;
                btn.innerText = "Summarize";
            });
            
    });
});
