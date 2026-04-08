import React from 'react';

const NavbarComponent = ({ setCurrentPage, appMode }) => {
  return (
    <nav className="min-w-[220px] h-screen fixed top-0 left-0 bg-gray-900 text-white shadow-lg">
      <div className="flex flex-col h-full p-6">
        <div className="space-y-3">

          {/* Always allowed */}
          <div
            onClick={() => setCurrentPage('users')}
            className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Users
          </div>

          <div
            onClick={() => setCurrentPage('settings')}
            className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Settings
          </div>

          {/* Normal mode only */}
          {appMode === "normal" && (
            <>
              <div
                onClick={() => setCurrentPage('allocation')}
                className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Allocation
              </div>

              <div
                onClick={() => setCurrentPage('thtc')}
                className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Transaction History, Taxes and Commissions
              </div>

              <div
                onClick={() => setCurrentPage('price_movement')}
                className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Share price movement
              </div>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export { NavbarComponent };
