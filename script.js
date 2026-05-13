async function runAnalysis() {
    const transcript = document.getElementById('transcriptInput').value;
    const runBtn = document.getElementById('runBtn');
    
    if (!transcript) return alert("Please paste a transcript first.");

    runBtn.innerText = "Analyzing...";
    runBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript })
        });

        const data = await response.json();
        renderAnalysis(data);
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to reach Ollama. Ensure backend is running.");
    } finally {
        runBtn.innerText = "Run AI Analysis";
        runBtn.disabled = false;
    }
}

function renderAnalysis(data) {
    document.getElementById('analysisOutput').classList.remove('hidden');
    
    // 1. Score & Justification
    document.getElementById('rubricScore').value = data.rubric_score.score;
    document.getElementById('justification').value = data.rubric_score.justification;

    // 2. Evidence (with "Delete" functionality)
    const evidenceContainer = document.getElementById('evidenceList');
    evidenceContainer.innerHTML = '';
    data.evidence.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-start bg-white p-3 rounded border text-sm";
        div.innerHTML = `
            <span><span class="font-bold ${getSentimentColor(item.sentiment)} text-xs uppercase">[${item.sentiment}]</span> "${item.quote}"</span>
            <button onclick="this.parentElement.remove()" class="text-red-400 ml-2 hover:text-red-600">✕</button>
        `;
        evidenceContainer.appendChild(div);
    });

    // 3. KPIs
    const kpiContainer = document.getElementById('kpiTags');
    kpiContainer.innerHTML = '';
    data.kpi_mapping.forEach(kpi => {
        const span = document.createElement('span');
        span.className = "bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-red-200";
        span.innerText = kpi;
        span.onclick = () => span.remove();
        kpiContainer.appendChild(span);
    });

    // 4. Gaps
    const gapContainer = document.getElementById('gapList');
    gapContainer.innerHTML = '';
    data.gap_analysis.forEach(gap => {
        const li = document.createElement('li');
        li.innerText = gap;
        li.contentEditable = true; // Intern can edit the text directly
        gapContainer.appendChild(li);
    });
}

function getSentimentColor(s) {
    if (s === 'positive') return 'text-green-600';
    if (s === 'negative') return 'text-red-600';
    return 'text-gray-500';
}

function exportFinal() {
    alert("Analysis finalized! The intern's edits have been captured.");
    // Here you would gather the current state of DOM elements and download as a PDF or JSON.
}
