import React from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

function App() {
  const [currentPage, setCurrentPage] = React.useState('');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavbarComponent setCurrentPage={setCurrentPage} />

      <main className="ml-[200px] flex-grow p-10">
        {currentPage === '' ? (
          <div className="text-center mt-32">
            <h1 className="text-5xl font-bold mb-6">Welcome to the Portfolio Dashboard</h1>
            <p className="text-xl text-gray-700">Select a page from the sidebar to get started.</p>
          </div>
        ) : (
          currentPage
        )}
      </main>
    </div>
  );
}

export default App;