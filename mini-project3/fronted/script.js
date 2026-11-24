const readmeForm = document.getElementById("readmeForm");

const projectNameInput = document.getElementById("projectName");
const descriptionInput = document.getElementById("description");
const featuresInput = document.getElementById("features");
const technologiesInput = document.getElementById("technologies");

const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");


let generatedReadme = "";

readmeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectData = {
        projectName: projectNameInput.value.trim(),
        description: descriptionInput.value.trim(),
        features: featuresInput.value.trim(),
        technologies: technologiesInput.value.trim()
    };

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating README...";
    status.textContent = "Gemini AI is generating your README. Please wait...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/readme/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(projectData)
            }
        );

        const responseText = await response.text();
        console.log("Backend status:", response.status);
        console.log("Backend response:", responseText);
        
        const data = JSON.parse(responseText);

        if (!response.ok) {
            throw new Error(data.error || "Failed to generate README.");
        }

        generatedReadme = data.readme;

        preview.innerHTML = marked.parse(generatedReadme);

        copyBtn.disabled = false;
        downloadBtn.disabled = false;

        status.textContent = "README generated successfully!";

    } catch (error) {
        console.error("Frontend Error:", error);

        status.textContent = error.message;

        preview.innerHTML = `
            <div class="empty-state">
                <h3>Generation Failed</h3>
                <p>${error.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
        `;

    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "✦ Generate README";
    }
});

copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(generatedReadme);

        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyBtn.textContent = "Copy Markdown";
        }, 2000);

    } catch (error) {
        status.textContent = "Unable to copy. Please try again.";
    }
});

downloadBtn.addEventListener("click", () => {
    const blob = new Blob(
        [generatedReadme],
        { type: "text/markdown" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "README.md";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});
