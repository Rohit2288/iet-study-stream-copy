import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

function Home() {
  const [papers, setPapers] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/papers`);
      const data = await response.json();
      setPapers(data);
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = selectedSemester === 'all'
    ? papers
    : papers.filter(paper => paper.semester === parseInt(selectedSemester));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Question Papers</h1>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredPapers.map((paper) => (
            <div 
              key={paper._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {paper.title}
                  </h3>
                  <p className="text-gray-600">Subject: {paper.subject}</p>
                  <p className="text-gray-600">Semester: {paper.semester}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded on: {new Date(paper.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <a 
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View Paper
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
