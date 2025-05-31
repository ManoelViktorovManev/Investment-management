import React from 'react';
const Navbar = () => {
    React.useEffect(() => {
        // Extract the 'verified' query parameter from the URL to determine the outcome of email verification.
        const queryParams = new URLSearchParams(window.location.search);
        const verified = queryParams.get('verified');
        if (verified != null) {
            // Display a success message if the email verification was successful (verified=true).
            if (verified === 'true') {
                alert('Successfully registered! Please log in.');
            }
            // Display an error message if the email verification failed (verified=false). 
            else {
                alert('Your email verification link has expired. It seems you’ve either already registered or didn’t confirm the link in time. Please register again to continue.'); // You might want to remove this or handle it differently
            }
            // Remove the query parameters from the URL to clean up the browser history.
            window.history.replaceState({}, document.title, '/');
            // test
        }
    }, []);

    return (
        <div>
            <a href="https://www.w3schools.com"> Home </a>
            <p > Portfolios </p>
            <p> Peoples </p> </div>);

}

export default Navbar;