// Function to apply a link based on the source database name in the table
function linkUsername() {
    // Select all table cells that contain source database names
    const usernamesCells = document.querySelectorAll('td.username');
    const excludedUsernames = ['sys', '', 'dbsnmp','','','','','']; // Add any other usernames to exclude here

    usernamesCells.forEach(cell => {
        const username = cell.textContent.trim(); // Get the raw source database name from the cell

        // Check if username length is less than 4 or greater than 5, or if username is in excludedUsernames list
        if (username.length < 4 || username.length > 5 || excludedUsernames.includes(username.toLowerCase())) {
            return; // Skip this username and do nothing
        }

        // Construct the URL using the source database name
        // In this part, you can convert usernames into links to your own ITSM or ticketsystem where the usernames are stored.
        const URL = `https://YourOwnCompanyITSM/global_search?q=${encodeURIComponent(username)}`;

        // Create a link element
        const link = document.createElement('a');
        link.href = URL;
        link.target = '_blank'; // Open in a new tab
        link.textContent = username; // Set the source database name as the link text

        // Clear the cell content and append the link
        cell.textContent = ''; // Clear existing text
        cell.appendChild(link); // Insert the new link
    });
}

// In this function, "source" is converted into a link so if you use enterprise manager you can link the source database to jump directly to it.
// Run the linkUsername function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    linkUsername(); // Call the function to link all source databases in the table
});

// Function to apply a link based on the source database name in the table
function linkSourceDatabase() {
    // Select all table cells that contain source database names
    const sourceDatabaseCells = document.querySelectorAll('td.source-database');

    sourceDatabaseCells.forEach(cell => {
        const sourceDatabase = cell.textContent.trim(); // Get the raw source database name from the cell

        // Construct the URL using the source database name
        const oracleUrl = `https://YourOEMServer:7802/em/faces/db-homepage-home?type=oracle_database&target=${encodeURIComponent(sourceDatabase)}`;

        // Create a link element
        const link = document.createElement('a');
        link.href = oracleUrl;
        link.target = '_blank'; // Open in a new tab
        link.textContent = sourceDatabase; // Set the source database name as the link text

        // Clear the cell content and append the link
        cell.textContent = ''; // Clear existing text
        cell.appendChild(link); // Insert the new link
    });
}

// Run the linkSourceDatabase function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    linkSourceDatabase(); // Call the function to link all source databases in the table
});


//This Function converts ORA-Returncodes into clickable URLs pointing to the ORacle Knowledge Base
// Function to format the return code based on its length and return the full ORA- code
function formatReturnCode(returnCode) {
  // Ensure the return code is a string
  returnCode = returnCode.toString().trim();

  // Determine how many leading zeros are needed
  const codeLength = returnCode.length;
  let formattedCode = '';

  switch (codeLength) {
      case 5:
          formattedCode = `ORA-${returnCode}`;
          break;
      case 4:
          formattedCode = `ORA-0${returnCode}`;
          break;
      case 3:
          formattedCode = `ORA-00${returnCode}`;
          break;
      case 2:
          formattedCode = `ORA-000${returnCode}`;
          break;
      case 1:
          formattedCode = `ORA-0000${returnCode}`;
          break;
      default:
          // Handle unexpected lengths or errors
          formattedCode = `${returnCode}`; // Just return what we have
          break;
  }

  return formattedCode;
}

// Function to apply the formatted return code as a URL link in the table
function linkReturnCodes() {
  // Select all table cells that contain return codes
  const returnCodeCells = document.querySelectorAll('td.return-code');

  returnCodeCells.forEach(cell => {
      const returnCode = cell.textContent.trim(); // Get the raw return code from the cell
      const formattedCode = formatReturnCode(returnCode); // Format the return code
      
      // Construct the Oracle documentation URL
      const oracleUrl = `https://docs.oracle.com/search/?q=${formattedCode}`;

      // Create a link element
      const link = document.createElement('a');
      link.href = oracleUrl;
      link.target = '_blank'; // Open in new tab
      link.textContent = formattedCode; // Set the formatted ORA-code as the link text

      // Clear the cell content and append the link
      cell.textContent = ''; // Clear existing text
      cell.appendChild(link); // Insert the new link
  });
}

// Run the linkReturnCodes function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  linkReturnCodes(); // Call the function to link all return codes in the table
});
