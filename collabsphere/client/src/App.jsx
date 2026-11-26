import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SimpleMDE from "react-simplemde-editor";
const API = "https://collabsphere-backend-9dlc.onrender.com/api";

const API = "http://127.0.0.1:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});

  const [notes, setNotes] = useState([]);

  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalTeamMembers: 0,
    totalNotes: 0,
    totalFiles: 0,
    projectContributions: []
  });

  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [readmeFeatures, setReadmeFeatures] = useState("");
  const [readmeTechnologies, setReadmeTechnologies] = useState("");
  const [readmeResult, setReadmeResult] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);

  const [docsResult, setDocsResult] = useState("");
  const [docsLoading, setDocsLoading] = useState(false);

  const [sharedProject, setSharedProject] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD PUBLIC SHARED PROJECT
  useEffect(() => {
    const shareToken =
      new URLSearchParams(window.location.search).get("share");

    if (!shareToken) return;

    setShareLoading(true);

    fetch(`${API}/projects/public/${encodeURIComponent(shareToken)}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Shared project not found.");
        }

        setSharedProject(data.project || data);
      })
      .catch((error) => {
        setShareError(error.message);
      })
      .finally(() => {
        setShareLoading(false);
      });
  }, []);

  // LOAD ANALYTICS
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((data) => setAnalytics(data))
      .catch((error) => console.error("Analytics error:", error));
  }, [token]);

  // COMMON API REQUEST FUNCTION
  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  // LOAD PROJECTS
  const loadProjects = async () => {
    try {
      const data = await request("/projects/my-projects");
      setProjects(Array.isArray(data) ? data : (data.projects || []));
    } catch (error) {
      setMessage(error.message);
    }
  };

  // LOAD ANALYTICS AGAIN
  const loadAnalytics = async () => {
    try {
      const data = await request("/analytics");
      setAnalytics(data);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  // LOAD PROJECT FILES
  const loadFiles = async (projectId) => {
    try {
      const data = await request(`/files/${projectId}`);
      setFiles(Array.isArray(data) ? data : (data.files || []));
    } catch (error) {
      setFiles([]);
      setMessage(error.message);
    }
  };

  // PREVIEW TEXT FILE
  const handlePreviewFile = async (file) => {
    try {
      const response = await fetch(
        `${API.replace("/api", "")}/uploads/${encodeURIComponent(file.filename)}`
      );

      if (!response.ok) {
        throw new Error("Unable to preview this file.");
      }

      const content = await response.text();

      setFilePreviews((prev) => ({
        ...prev,
        [file._id]: content
      }));
    } catch (error) {
      setMessage(error.message);
    }
  };

  // UPLOAD FILE
  const handleFileUpload = async () => {
    if (!selectedFile || !selectedProject) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("projectId", selectedProject._id);

      const response = await fetch(`${API}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage("File uploaded successfully!");
      setSelectedFile(null);

      await loadFiles(selectedProject._id);
      await loadAnalytics();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  // LOGIN AND REGISTRATION
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            isRegister ? { name, email, password } : { email, password }
          )
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      if (isRegister) {
        setMessage("Registration successful! Please log in.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", result.token);
        setToken(result.token);
        setMessage("Welcome to CollabSphere!");

        const projectResponse = await fetch(
          `${API}/projects/my-projects`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`
            }
          }
        );

        const projectData = await projectResponse.json();

        if (!projectResponse.ok) {
          throw new Error(projectData.message);
        }

        setProjects(
          Array.isArray(projectData)
            ? projectData
            : (projectData.projects || [])
        );
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE PROJECT
  const createProject = async (e) => {
    e.preventDefault();

    try {
      await request("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          description
        })
      });

      setProjectName("");
      setDescription("");
      setMessage("Project created successfully!");

      await loadProjects();
      await loadAnalytics();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // OPEN PROJECT
  const openProject = async (project) => {
    setSelectedProject(project);
    setAiResult("");
    setReadmeResult("");
    setDocsResult("");
    setFilePreviews({});
    setMessage("");

    try {
      const [notesData] = await Promise.all([
        request(`/notes/${project._id}`),
        loadFiles(project._id)
      ]);

      setNotes(notesData.notes || []);
    } catch (error) {
      setNotes([]);
      setFiles([]);
      setMessage(error.message);
    }
  };

  // GEMINI EXPLAIN AND IMPROVE NOTE
  const handleAI = async (noteId, action) => {
    setAiLoading(true);
    setAiResult("");
    setMessage("");

    try {
      const data = await request(`/ai/${action}/${noteId}`, {
        method: "POST"
      });

      setAiResult(data.result || "No AI response received.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // EXPLAIN UPLOADED CODE
  const handleExplainCode = async (fileId) => {
    setAiLoading(true);
    setAiResult("");
    setMessage("");

    try {
      const data = await request(`/ai/explain-code/${fileId}`, {
        method: "POST"
      });

      setAiResult(data.result || "No explanation received.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // GENERATE README WITH GEMINI
  const generateReadme = async (e) => {
    e.preventDefault();

    if (!selectedProject) return;

    setReadmeLoading(true);
    setReadmeResult("");
    setMessage("");

    try {
      const data = await request(
        `/ai/generate-readme/${selectedProject._id}`,
        {
          method: "POST",
          body: JSON.stringify({
            features: readmeFeatures,
            technologies: readmeTechnologies
          })
        }
      );

      setReadmeResult(data.result || "No README generated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setReadmeLoading(false);
    }
  };

  // GENERATE PROJECT DOCUMENTATION
  const generateDocs = async () => {
    if (!selectedProject) return;

    setDocsLoading(true);
    setDocsResult("");
    setMessage("");

    try {
      const data = await request(
        `/ai/docs/${selectedProject._id}`,
        {
          method: "POST"
        }
      );

      setDocsResult(data.result || "No documentation generated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDocsLoading(false);
    }
  };

  // ADD PROJECT MEMBER
  const addMember = async (e) => {
    e.preventDefault();

    try {
      await request(`/projects/${selectedProject._id}/members`, {
        method: "POST",
        body: JSON.stringify({
          email: memberEmail
        })
      });

      setMemberEmail("");
      setMessage("Member added successfully!");

      await loadProjects();
      await loadAnalytics();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // CREATE NOTE
  const createNote = async () => {
    try {
      await request("/notes", {
        method: "POST",
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          projectId: selectedProject._id
        })
      });

      setNoteTitle("");
      setNoteContent("");
      setMessage("Note created successfully!");

      await openProject(selectedProject);
      await loadAnalytics();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // EDIT NOTE
  const editNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  // UPDATE NOTE
  const updateNote = async () => {
    try {
      await request(`/notes/${editingNote._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent
        })
      });

      setMessage("Note updated successfully!");
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");

      await openProject(selectedProject);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // DELETE NOTE
  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await request(`/notes/${noteId}`, {
        method: "DELETE"
      });

      setMessage("Note deleted successfully!");
      await openProject(selectedProject);
      await loadAnalytics();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // SHARE PROJECT
  const shareProject = async () => {
    try {
      const data = await request(
        `/projects/${selectedProject._id}/share`,
        {
          method: "POST"
        }
      );

      if (!data.shareUrl) {
        throw new Error("Share link was not generated.");
      }

      const shareToken = data.shareUrl.split("/").pop();

      const publicLink =
        `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(shareToken)}`;

      await navigator.clipboard.writeText(publicLink);

      setMessage("Public project link copied successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setProjects([]);
    setSelectedProject(null);
    setNotes([]);
    setFiles([]);
    setSelectedFile(null);
    setAiResult("");
    setReadmeResult("");
    setDocsResult("");
    setMessage("Logged out successfully.");
  };

  // PUBLIC SHARED PROJECT PAGE
  if (new URLSearchParams(window.location.search).get("share")) {
    if (shareLoading) {
      return (
        <main className="auth-page">
          <section className="auth-card">
            <h2>Loading shared project...</h2>
          </section>
        </main>
      );
    }

    if (!sharedProject) {
      return (
        <main className="auth-page">
          <section className="auth-card">
            <div className="brand">✦ CollabSphere</div>
            <h1>Project not found</h1>
            <p>{shareError || "This shared link may be invalid or disabled."}</p>
          </section>
        </main>
      );
    }

    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand">✦ CollabSphere</div>
          <p className="muted">PUBLIC PROJECT</p>
          <h1>{sharedProject.name}</h1>
          <p>{sharedProject.description || "No description available."}</p>
          <p className="muted">Read-only shared project</p>
        </section>
      </main>
    );
  }

  // LOGIN PAGE
  if (!token) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <div className="brand">✦ CollabSphere</div>

          <p className="muted">
            Your space. Your team. Your projects.
          </p>

          <h1>{isRegister ? "Create an account" : "Welcome back!"}</h1>

          {isRegister && (
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Register"
                : "Login"}
          </button>

          <p className="switch">
            {isRegister
              ? "Already have an account?"
              : "New to CollabSphere?"}

            <span onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? " Login" : " Create account"}
            </span>
          </p>

          {message && <p className="message">{message}</p>}
        </form>
      </main>
    );
  }

  // MAIN APPLICATION
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">✦ CollabSphere</div>

        <p className="side-label">WORKSPACE</p>

        <button
          className="side-link"
          onClick={() => {
            setSelectedProject(null);
            setAiResult("");
          }}
        >
          ▦ &nbsp; Dashboard
        </button>

        <p className="side-label">YOUR PROJECTS</p>

        {projects.map((project) => (
          <button
            className="side-link"
            key={project._id}
            onClick={() => openProject(project)}
          >
            ◈ &nbsp; {project.name}
          </button>
        ))}

        <button className="logout" onClick={logout}>
          ↪ Logout
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="muted">COLLABORATION WORKSPACE</p>
            <h2>{selectedProject ? selectedProject.name : "Dashboard"}</h2>
          </div>

          <div className="avatar">CS</div>
        </header>

        {message && <p className="message">{message}</p>}

        {!selectedProject ? (
          <>
            <section className="welcome">
              <div>
                <p>YOUR TEAM WORKSPACE</p>
                <h1>Build something great together.</h1>
                <span>
                  Manage projects, share ideas and collaborate with your team.
                </span>
              </div>

              <div className="welcome-icon">✦</div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Your Projects</h2>
                <p className="muted">
                  Manage all your collaborative work.
                </p>
              </div>

              <span className="count">{projects.length} Projects</span>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <span>📁</span>
                <h3>Total Projects</h3>
                <h2>{analytics.totalProjects}</h2>
              </div>

              <div className="analytics-card">
                <span>👥</span>
                <h3>Team Members</h3>
                <h2>{analytics.totalTeamMembers}</h2>
              </div>

              <div className="analytics-card">
                <span>📝</span>
                <h3>Total Notes</h3>
                <h2>{analytics.totalNotes}</h2>
              </div>

              <div className="analytics-card">
                <span>📂</span>
                <h3>Uploaded Files</h3>
                <h2>{analytics.totalFiles}</h2>
              </div>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project._id}>
                  <div className="project-icon">◈</div>

                  <h3>{project.name}</h3>

                  <p>{project.description || "No description added."}</p>

                  <p className="muted">
                    {project.members?.length || 0} team members
                  </p>

                  <button onClick={() => openProject(project)}>
                    Open Project →
                  </button>
                </article>
              ))}

              {projects.length === 0 && (
                <p className="muted">
                  No projects yet. Create your first project below.
                </p>
              )}
            </div>

            <section className="panel">
              <h2>＋ Create a new project</h2>

              <form onSubmit={createProject}>
                <input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />

                <input
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <button>Create Project</button>
              </form>
            </section>
          </>
        ) : (
          <>
            <button
              className="back"
              onClick={() => {
                setSelectedProject(null);
                setAiResult("");
              }}
            >
              ← Back to dashboard
            </button>

            <section className="welcome">
              <div>
                <p>PROJECT WORKSPACE</p>
                <h1>{selectedProject.name}</h1>

                <span>
                  {selectedProject.description ||
                    "Collaborate with your team."}
                </span>

                <div>
                  <button type="button" onClick={shareProject}>
                    Share Project
                  </button>
                </div>
              </div>

              <div className="welcome-icon">◈</div>
            </section>

            {/* ADD TEAM MEMBER */}
            <section className="panel">
              <h2>＋ Add a team member</h2>

              <form onSubmit={addMember}>
                <input
                  type="email"
                  placeholder="Registered user's email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />

                <button>Add Member</button>
              </form>
            </section>

            {/* MEMBER CONTRIBUTION ANALYTICS */}
            <section className="panel">
              <h2>📊 Team Contribution Analytics</h2>

              {(analytics.projectContributions || [])
                .filter(
                  (item) =>
                    String(item.projectId) === String(selectedProject._id)
                )
                .map((item) => (
                  <div key={item.projectId}>
                    {item.members?.map((member) => (
                      <div className="file-item" key={member.userId}>
                        <div>
                          <strong>{member.name}</strong>
                          <p className="muted">{member.email}</p>
                        </div>

                        <p>Notes created: {member.notesCreated}</p>
                        <p>Files uploaded: {member.filesUploaded}</p>
                      </div>
                    ))}
                  </div>
                ))}

              {!(analytics.projectContributions || []).some(
                (item) =>
                  String(item.projectId) === String(selectedProject._id)
              ) && (
                <p className="muted">No contribution data available yet.</p>
              )}
            </section>

            {/* PROJECT FILES */}
            <section className="panel">
              <h2>📁 Project Files</h2>

              <p className="muted">
                Upload and share files with your project team (maximum 10 MB).
              </p>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.js,.py,.css,.html"
                onChange={(e) =>
                  setSelectedFile(e.target.files[0] || null)
                }
              />

              {selectedFile && (
                <p className="muted">
                  Selected: {selectedFile.name}
                </p>
              )}

              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </button>

              <div className="file-list">
                {files.map((file) => {
                  const fileUrl =
                    `${API.replace("/api", "")}/uploads/${encodeURIComponent(file.filename)}`;

                  const isImage =
                    /\.(jpg|jpeg|png|gif)$/i.test(file.originalName);

                  const isText =
                    /\.(txt|js|py|css|html)$/i.test(file.originalName);

                  return (
                    <div className="file-item" key={file._id}>
                      <span>📄 {file.originalName}</span>

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>

                      {isImage && (
                        <div className="file-preview">
                          <img
                            src={fileUrl}
                            alt={file.originalName}
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              objectFit: "contain"
                            }}
                          />
                        </div>
                      )}

                      {isText && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePreviewFile(file)}
                          >
                            Preview File
                          </button>

                          {filePreviews[file._id] !== undefined && (
                            <pre className="file-preview">
                              {filePreviews[file._id]}
                            </pre>
                          )}
                        </>
                      )}

                      {/\.(js|py)$/i.test(file.originalName) && (
                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={() => handleExplainCode(file._id)}
                        >
                          Explain Code with Gemini
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {files.length === 0 && (
                <p className="muted">
                  No files uploaded to this project yet.
                </p>
              )}
            </section>

            {/* README GENERATOR */}
            <section className="panel">
              <h2>✦ Generate README with Gemini</h2>

              <p className="muted">
                Generate a professional README.md for your project.
              </p>

              <form onSubmit={generateReadme}>
                <textarea
                  placeholder="Enter your project features..."
                  value={readmeFeatures}
                  onChange={(e) => setReadmeFeatures(e.target.value)}
                  required
                />

                <textarea
                  placeholder="Enter technologies used..."
                  value={readmeTechnologies}
                  onChange={(e) => setReadmeTechnologies(e.target.value)}
                  required
                />

                <button type="submit" disabled={readmeLoading}>
                  {readmeLoading
                    ? "Generating README..."
                    : "Generate README"}
                </button>
              </form>

              {readmeResult && (
                <div className="readme-result">
                  <h3>Generated README</h3>

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {readmeResult}
                  </ReactMarkdown>
                </div>
              )}
            </section>

            {/* GEMINI DOCUMENTATION GENERATOR */}
            <section className="panel">
              <h2>✦ Generate Project Documentation</h2>

              <p className="muted">
                Generate technical documentation for your project using Gemini.
              </p>

              <button
                type="button"
                onClick={generateDocs}
                disabled={docsLoading}
              >
                {docsLoading
                  ? "Generating Documentation..."
                  : "Generate Docs"}
              </button>

              {docsResult && (
                <div className="readme-result">
                  <h3>Project Documentation</h3>

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {docsResult}
                  </ReactMarkdown>
                </div>
              )}
            </section>

            {/* CREATE OR EDIT NOTE */}
            <section className="panel">
              <h2>
                {editingNote ? "✏️ Edit Note" : "＋ Create a note"}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editingNote ? updateNote() : createNote();
                }}
              >
                <input
                  placeholder="Note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />

                <SimpleMDE
                  value={noteContent}
                  onChange={setNoteContent}
                  options={{
                    spellChecker: false,
                    status: false,
                    minHeight: "180px",
                    placeholder: "Write your project notes in Markdown..."
                  }}
                />

                <button type="submit">
                  {editingNote ? "Update Note" : "Save Note"}
                </button>

                {editingNote && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null);
                      setNoteTitle("");
                      setNoteContent("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </section>

            {/* PROJECT NOTES */}
            <div className="section-heading">
              <div>
                <h2>Project Notes</h2>

                <p className="muted">
                  Ideas and updates shared by your team.
                </p>
              </div>

              <span className="count">{notes.length} Notes</span>
            </div>

            <div className="notes-list">
              {notes.map((note) => (
                <article className="note-card" key={note._id}>
                  <h3>▤ &nbsp; {note.title}</h3>

                  <div className="note-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content || ""}
                    </ReactMarkdown>
                  </div>

                  <small>
                    By {note.author?.name || "Project member"} ·{" "}
                    {new Date(note.createdAt).toLocaleDateString()}
                  </small>

                  <div className="note-actions">
                    <button onClick={() => editNote(note)}>
                      Edit
                    </button>

                    <button onClick={() => deleteNote(note._id)}>
                      Delete
                    </button>

                    <button
                      disabled={aiLoading}
                      onClick={() => handleAI(note._id, "explain")}
                    >
                      Explain with AI
                    </button>

                    <button
                      disabled={aiLoading}
                      onClick={() => handleAI(note._id, "improve")}
                    >
                      Improve with AI
                    </button>
                  </div>
                </article>
              ))}

              {notes.length === 0 && (
                <p className="muted">
                  No notes yet. Create your first note above.
                </p>
              )}
            </div>

            {/* AI LOADING */}
            {aiLoading && (
              <section className="panel">
                <p>Gemini is thinking... Please wait.</p>
              </section>
            )}

            {/* AI RESULT */}
            {aiResult && (
              <section className="panel ai-result">
                <h2>✦ Gemini AI Response</h2>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResult}
                </ReactMarkdown>

                <button onClick={() => setAiResult("")}>
                  Close AI Response
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
