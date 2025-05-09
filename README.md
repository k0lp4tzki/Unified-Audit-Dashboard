# Unified Audit Dashboard

Welcome to the Unified Audit Dashboard!  
This project provides a clean, modern web interface to view and filter audit data from an Oracle database.

> **Note:**  
> This project was created with the help of GPT (AI-supported prompting and development).  
> Despite this assistance, completing it still took quite a bit of time — because even AIs aren't perfect! 😉  
> This dashboard is provided as a pure hobby project **without any warranty or official support**.  
> Suggestions, issues, and merge requests are very welcome, but please understand that I maintain this project in my free time.  
> Everyone is encouraged to adapt and modify the code to fit their own needs!

---

# Update 05-09-2025
## Reports functionality added

![grafik](https://github.com/user-attachments/assets/cbe1349a-2ade-401f-8d1f-668f77b78083)


# Coming soon!
### Generate Monthly reports about your auditing!

![grafik](https://github.com/user-attachments/assets/9f99a6a1-140f-4043-accc-6353c7e623de)


# Update 05-05-2025

### Dynamic Linechart
Linechart reacts now dynamically to the filtered content
![linechart_dynamic-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/63725f6b-b89b-43fa-b97d-30a0d5300c31)


### Display Filter 
![grafik](https://github.com/user-attachments/assets/0f47b2d8-edec-4145-a829-f5e6e227e110)

# Update 05-01-2025: 
### Day-to-Hour Filtering!
![](UAD/assets/linechart_update.gif)



# Preview
![grafik](https://github.com/user-attachments/assets/472c00c2-3c4e-45e1-be45-4c269edcd1fd)

![Filter Example](UAD/assets/grafik-6.png)

![grafik](https://github.com/user-attachments/assets/e0f12947-1a1a-414a-81a8-3cf6fe1c3bbb)


## Project Structure

Below is an overview of the most important files and their roles:

| File | Purpose |
|:---|:---|
| **filtertable.js** | Functions to filter the table data dynamically based on user input. |
| **linechart.js** | Setup and rendering logic for the line chart visualization. |
| **piechart.js** | Setup and rendering logic for the pie chart visualization (similar to linechart.js). |
| **sidebar.js** | Initialization and control of the sidebar interface (similar to linechart.js). |
| **main.js** | Main JavaScript functions that control the webpage (excluding direct HTML or PHP operations). |
| **db_queries.php** | Contains all database queries and access logic. |
| **fetch_session.php** | Handles fetching and validating the user session status. |

---

## License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute the code, with appropriate attribution.

---

## Support

If you find this project helpful and would like to support it:

☕ [Buy me a coffee](https://buymeacoffee.com/denniskolpatzki)  
💸 [Donate via PayPal](https://paypal.me/MindFck)

Thank you for supporting open-source and hobby-driven projects! ❤️

---

## Disclaimer

This software is provided "as is", without warranty of any kind, express or implied,  
including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.  
In no event shall the authors be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

---
(c) 2025 [Dennis Kolpatzki] ([github.com/k0lp4tzki](https://github.com/k0lp4tzki))
