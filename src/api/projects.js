export async function submitProject(projectData) {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectData)
  });
  return response.json();
} 