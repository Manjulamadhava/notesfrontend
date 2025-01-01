import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import AddEditNotes from './AddEditNotes';
import axiosInstance from '../../utils/axiosInstance';
import Modal from 'react-modal';
import Toast from '../../components/ToastMessage/Toast';

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: '',
    type: 'add',
  });

  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: 'edit' });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: '',
    });
  };

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  // Get all Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get('/get-all-notes');
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again');
    }
  };

  // Delete Note
  const deleteNode = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete('/delete-note/' + noteId);
      if (response.data && !response.data.error) {
        showToastMessage('Note deleted successfully', 'delete');
        getAllNotes();
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again');
    }
  };

  // Search for Note
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get('/search-notes', {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setSearchResults(response.data.notes);
      } else {
        setIsSearch(true);
        setSearchResults([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put('/update-note-pinned/' + noteId, {
        isPinned: !noteData.isPinned,
      });

      if (response.data && response.data.note) {
        showToastMessage('Note updated successfully');
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  const notesToDisplay = isSearch ? searchResults : allNotes;

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto">
        {notesToDisplay.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {notesToDisplay.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNode(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src="https://img.icons8.com/ios/500/empty-box.png"
              alt="Empty note View"
              className="w-48 h-48"
            />
            <p className="mt-4 text-lg text-gray-600">
              {isSearch
                ? 'No notes found for the given search. Try again!'
                : 'Start creating your first note! Click the Add button to jot down your thoughts, ideas, and reminders. Let\'s get started.'}
            </p>
          </div>
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: 'add', data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: 'add', data: null })
        }
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.2)',
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: 'add', data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
