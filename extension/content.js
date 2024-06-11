document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("button");

    btn.addEventListener("click", function() {
        const startInput = document.getElementById("start");
        const endInput = document.getElementById("end");

        const startTime = startInput.value?startInput.value:0;
        const endTime = endInput.value;

        btn.disabled = true;
        btn.innerHTML = "Summarising...";

        
        const url = "https://youtu.be/IG0J_ynkemI?si=eoRH5_j0hgVe-b23";

        fetch(`http://127.0.0.1:5000/summary?url=${encodeURIComponent(url)}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`)
            .then(response => response.json()) 
            .then(data => {
                const output = document.getElementById("output");
                output.innerText = data.summary;
                btn.disabled = false;
                btn.innerHTML = "Summarize";
            })
            .catch(error => {
                console.error('Error during summarization:', error);
                btn.disabled = false;
                btn.innerHTML = "Summarize";
            });
    });
});
