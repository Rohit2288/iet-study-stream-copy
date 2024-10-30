
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

// function UploadPaper() {
//   const [formData, setFormData] = useState({
//     title: '',
//     subject: '',
//     semester: '1',
//   });
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       setError('Please upload a file.');
//       return;
//     }

//     setUploading(true);
//     setError('');

//     try {
//       const uploadFormData = new FormData();
//       uploadFormData.append('file', file); // Append the selected file
//       uploadFormData.append('title', formData.title);
//       uploadFormData.append('subject', formData.subject);
//       uploadFormData.append('semester', formData.semester);
//       uploadFormData.append('userId', user._id); // Pass the logged-in user ID

//       const response = await fetch(`${backendUrl}/api/papers`, {
//         method: 'POST',
//         body: uploadFormData,
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         navigate('/papers');
//       } else {
//         setError(data.message);
//       }
//     } catch (err) {
//       setError('Failed to upload paper. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Upload Question Paper</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
//         )}

//         <div>
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//             Paper Title
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             className="input mt-1"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
//             Subject
//           </label>
//           <input
//             type="text"
//             id="subject"
//             value={formData.subject}
//             onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//             className="input mt-1"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
//             Semester
//           </label>
//           <select
//             id="semester"
//             value={formData.semester}
//             onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
//             className="input mt-1"
//           >
//             {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
//               <option key={sem} value={sem}>
//                 Semester {sem}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label htmlFor="file" className="block text-sm font-medium text-gray-700">
//             File
//           </label>
//           <input
//             type="file"
//             id="file"
//             onChange={handleFileChange}
//             className="input mt-1"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className={`btn-primary ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           disabled={uploading}
//         >
//           {uploading ? 'Uploading...' : 'Upload Paper'}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default UploadPaper;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

function UploadPaper() {
  const [formData, setFormData] = useState({
    subject: '',
    semester: '1',
    mst1: null,
    mst2: null,
    mst3: null,
    endsem: null,
    notes: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasAnyFile = formData.mst1 || formData.mst2 || formData.mst3 || formData.endsem || formData.notes;
    if (!hasAnyFile) {
      setError('Please upload at least one file.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('semester', formData.semester);
      uploadFormData.append('userId', user._id);

      if (formData.mst1) uploadFormData.append('mst1', formData.mst1);
      if (formData.mst2) uploadFormData.append('mst2', formData.mst2);
      if (formData.mst3) uploadFormData.append('mst3', formData.mst3);
      if (formData.endsem) uploadFormData.append('endsem', formData.endsem);
      if (formData.notes) uploadFormData.append('notes', formData.notes);

      const response = await fetch(`${backendUrl}/api/papers`, {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/papers');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to upload paper. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (name) => (e) => {
    setFormData({ ...formData, [name]: e.target.files[0] });
  };

  const fileInputs = [
    { name: 'mst1', label: 'MST 1' },
    { name: 'mst2', label: 'MST 2' },
    { name: 'mst3', label: 'MST 3' },
    { name: 'endsem', label: 'End Semester' },
    { name: 'notes', label: 'Notes' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Question Papers</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
        )}

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
            Semester
          </label>
          <select
            id="semester"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            className="input mt-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {fileInputs.map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="file"
              id={name}
              onChange={handleFileChange(name)}
              className="input mt-1"
            />
          </div>
        ))}

        <button
          type="submit"
          className={`btn-primary w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Papers'}
        </button>
      </form>
    </div>
  );
}
export default UploadPaper;