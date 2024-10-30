
import { useState, useEffect } from 'react';
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

function ViewPapers() {
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({
    semester: 'all',
    subject: '',
  });
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

  const filteredPapers = papers.filter(paper => {
    const semesterMatch = filters.semester === 'all' || paper.semester === parseInt(filters.semester);
    const subjectMatch = !filters.subject || 
      paper.subject.toLowerCase().includes(filters.subject.toLowerCase());
    return semesterMatch && subjectMatch;
  });

  // Group papers by subject and semester
  const papersBySubject = filteredPapers.reduce((acc, paper) => {
    const key = `${paper.subject}-${paper.semester}`;
    if (!acc[key]) {
      acc[key] = {
        subject: paper.subject,
        semester: paper.semester,
        materials: []
      };
    }
    acc[key].materials.push(paper);
    return acc;
  }, {});

  const getAvailableMaterials = (papers) => {
    const availableMaterials = [];
    papers.forEach(paper => {
      if (paper.mst1Url) availableMaterials.push({ type: 'MST 1', url: paper.mst1Url });
      if (paper.mst2Url) availableMaterials.push({ type: 'MST 2', url: paper.mst2Url });
      if (paper.mst3Url) availableMaterials.push({ type: 'MST 3', url: paper.mst3Url });
      if (paper.endsemUrl) availableMaterials.push({ type: 'End Semester', url: paper.endsemUrl });
      if (paper.notesUrl) availableMaterials.push({ type: 'Notes', url: paper.notesUrl });
    });
    return availableMaterials;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">View Question Papers</h2>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              placeholder="Search by subject..."
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(papersBySubject).map(({ subject, semester, materials }) => (
            <div 
              key={`${subject}-${semester}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* Subject Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                {subject}
              </h3>

              {/* Available Materials */}
              <div className="space-y-3">
                {getAvailableMaterials(materials).map((material, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">
                      {material.type}
                    </span>
                    <a 
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      View
                    </a>
                  </div>
                ))}
                {getAvailableMaterials(materials).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No materials available</p>
                )}
              </div>

              {/* Semester Info */}
              <div className="mt-4 pt-2 border-t text-sm text-gray-500">
                Semester: {semester}
              </div>
            </div>
          ))}
          {Object.keys(papersBySubject).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No papers found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewPapers;