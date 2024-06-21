function userLogin() {
    // Replace the following lines with your actual email and password
    const actualUserEmail = '21z330@psgtech.ac.in';
    const actualUserPassword = 'userpass';

    // Get values entered by the user
    const enteredUserEmail = document.getElementById('userEmail').value;
    const enteredUserPassword = document.getElementById('userPassword').value;

    // Check if entered values match the actual values
    if (
        enteredUserEmail === actualUserEmail &&
        enteredUserPassword === actualUserPassword
    ) {
        // Assuming login is successful, redirect to user dashboard
        window.location.href = 'kpl.html';
    } else {
        alert('Invalid user credentials. Please try again.');
    }
}

function adminLogin() {
    // Replace the following lines with your actual email and password
    const actualAdminEmail = '21z330@psgtech.ac.in';
    const actualAdminPassword = 'portfoliowebsite';

    // Get values entered by the user
    const enteredAdminEmail = document.getElementById('adminEmail').value;
    const enteredAdminPassword = document.getElementById('adminPassword').value;

    // Check if entered values match the actual values
    if (
        enteredAdminEmail === actualAdminEmail &&
        enteredAdminPassword === actualAdminPassword
    ) {
        // Assuming login is successful, redirect to admin dashboard
        window.location.href = 'addash.html';
    } else {
        alert('Invalid admin credentials. Please try again.');
    }
}



