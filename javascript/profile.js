// Ensure the DOM is ready before executing script
document.addEventListener('DOMContentLoaded', function () {
    // --- Constants and State ---
    const MAX_PROJECTS = 3;
    let visibleProjectCount = 1;

    // --- DOM Elements ---
    const firstNameEl = document.getElementById('first-name');
    const lastNameEl = document.getElementById('last-name');
    const ageEl = document.getElementById('age');
    const emailEl = document.getElementById('email');
    const linkedinLinkEl = document.getElementById('linkedinLink');
    const aboutEl = document.getElementById('about');
    const profileImgEl = document.getElementById('profile-img');
    const navProfileImgEl = document.getElementById('nav-profile-img');
    const navUserNameEl = document.getElementById('nav-user-name');

    const weatherApiCheckbox = document.getElementById('weather-api');
    const stockApiCheckbox = document.getElementById('stock-api');

    const addProjectBtn = document.getElementById('add-project-btn');
    const profileForm = document.getElementById('profile-form');
    const imgUploadInput = document.getElementById('img-upload');
    const updateImgBtn = document.getElementById('update-img-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Helper Functions ---
    function updateAddProjectButtonVisibility() {
        if (visibleProjectCount >= MAX_PROJECTS) {
            addProjectBtn.style.display = 'none';
        } else {
            addProjectBtn.style.display = 'block';
        }
    }

    function clearProjectEntryFields(projectNum) {
        const projectEntry = document.getElementById(`project-entry-${projectNum}`);
        if (projectEntry) {
            projectEntry.querySelector('.project-title').value = '';
            projectEntry.querySelector('.project-description').value = '';
            projectEntry.querySelector('.project-image-url').value = ''; // Clear image URL
            projectEntry.querySelectorAll(`.competencies-checkbox-group input[name='competencies-${projectNum}']`).forEach(cb => {
                cb.checked = false;
            });
        }
    }

    function copyProjectData(sourceNum, destNum) {
        const sourceEntry = document.getElementById(`project-entry-${sourceNum}`);
        const destEntry = document.getElementById(`project-entry-${destNum}`);

        if (sourceEntry && destEntry) {
            destEntry.querySelector('.project-title').value = sourceEntry.querySelector('.project-title').value;
            destEntry.querySelector('.project-description').value = sourceEntry.querySelector('.project-description').value;
            destEntry.querySelector('.project-image-url').value = sourceEntry.querySelector('.project-image-url').value; // Copy image URL
            
            const sourceCompetencies = sourceEntry.querySelectorAll(`.competencies-checkbox-group input[name='competencies-${sourceNum}']`);
            const destCompetencies = destEntry.querySelectorAll(`.competencies-checkbox-group input[name='competencies-${destNum}']`);
            
            destCompetencies.forEach(destCb => destCb.checked = false); 

            sourceCompetencies.forEach(sourceCb => {
                if (sourceCb.checked) {
                    const destCb = destEntry.querySelector(`.competencies-checkbox-group input[value='${sourceCb.value}'][name='competencies-${destNum}']`);
                    if (destCb) destCb.checked = true;
                }
            });
        }
    }

    // --- Data Persistence ---
    function persistProfileData() {
        let currentUser = JSON.parse(localStorage.getItem('user')) || {};
        let users = JSON.parse(localStorage.getItem('USERS')) || [];
        const userIndex = users.findIndex(u => u.userId === currentUser.userId);

        currentUser.firstName = firstNameEl.value.trim();
        currentUser.lastName = lastNameEl.value.trim();
        currentUser.about = aboutEl.value.trim();
        // currentUser.profilePicture is updated directly by imgUpload.onchange

        if (userIndex !== -1) {
            users[userIndex].firstName = currentUser.firstName;
            users[userIndex].lastName = currentUser.lastName;
            users[userIndex].about = currentUser.about;
            users[userIndex].profilePicture = currentUser.profilePicture;
            users[userIndex].linkedinLink = linkedinLinkEl.value.trim(); 
        } else {
            users.push({ 
                ...currentUser, 
                linkedinLink: linkedinLinkEl.value.trim(),
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                about: currentUser.about,
                profilePicture: currentUser.profilePicture,
            });
        }
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('USERS', JSON.stringify(users));

        const userProfileData = {
            email: currentUser.email, 
            age: ageEl.value.trim(),
            linkedinLink: linkedinLinkEl.value.trim(),
            weatherApi: weatherApiCheckbox.checked,
            stockApi: stockApiCheckbox.checked,
            projects: []
        };

        for (let i = 1; i <= MAX_PROJECTS; i++) { 
            const projectEntry = document.getElementById(`project-entry-${i}`);
            if (projectEntry && projectEntry.style.display !== 'none') {
                const title = projectEntry.querySelector('.project-title').value.trim();
                const description = projectEntry.querySelector('.project-description').value.trim();
                const imageUrl = projectEntry.querySelector('.project-image-url').value.trim(); // Get image URL
                const competencies = [];
                projectEntry.querySelectorAll(`.competencies-checkbox-group input[name='competencies-${i}']:checked`).forEach(cb => {
                    competencies.push(cb.value);
                });

                if (i <= visibleProjectCount) { // This condition might be redundant with the loop below, but ensures we only consider visible ones
                     userProfileData.projects.push({ title, description, competencies, image: imageUrl });
                }
            }
        }
        // Correctly gather projects based on visibleProjectCount for saving
        const finalProjectsToSave = [];
        for (let i = 1; i <= visibleProjectCount; i++) {
            const projectEntry = document.getElementById(`project-entry-${i}`);
            if (projectEntry && projectEntry.style.display !== 'none') { 
                const title = projectEntry.querySelector('.project-title').value.trim();
                const description = projectEntry.querySelector('.project-description').value.trim();
                const imageUrl = projectEntry.querySelector('.project-image-url').value.trim(); // Get image URL again for the final list
                const competencies = [];
                projectEntry.querySelectorAll(`.competencies-checkbox-group input[name='competencies-${i}']:checked`).forEach(cb => {
                    competencies.push(cb.value);
                });
                finalProjectsToSave.push({ title, description, competencies, image: imageUrl });
            }
        }
        userProfileData.projects = finalProjectsToSave;

        // Save global competencies
        userProfileData.globalCompetencies = [];
        const globalCompetencyCheckboxes = document.querySelectorAll('#global-competencies-checkbox-group input[name="global-competencies"]:checked');
        globalCompetencyCheckboxes.forEach(cb => {
            userProfileData.globalCompetencies.push(cb.value);
        });

        localStorage.setItem('userProfile', JSON.stringify(userProfileData));

        const selectedAPIs = [];
        if (weatherApiCheckbox.checked) selectedAPIs.push('weather');
        if (stockApiCheckbox.checked) selectedAPIs.push('stock');
        localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));
        
        if (localStorage.getItem('isNewUser') === 'true') {
            localStorage.removeItem('isNewUser'); 
        }
    }

    function handleRemoveProjectClick(projectNumToRemove) {
        console.log('[PROFILE.JS] handleRemoveProjectClick called for projectNumToRemove:', projectNumToRemove, 'Current visibleProjectCount:', visibleProjectCount);
        if (projectNumToRemove <= 1 || projectNumToRemove > visibleProjectCount) {
            console.log('[PROFILE.JS] Condition (projectNumToRemove <= 1 || projectNumToRemove > visibleProjectCount) is TRUE. Returning.');
            return;
        }

        if (projectNumToRemove < visibleProjectCount) {
            console.log('[PROFILE.JS] Shifting projects. projectNumToRemove:', projectNumToRemove, 'visibleProjectCount:', visibleProjectCount);
            for (let i = projectNumToRemove; i < visibleProjectCount; i++) {
                console.log('[PROFILE.JS] Copying data from project', i + 1, 'to project', i);
                copyProjectData(i + 1, i);
            }
        }
        
        console.log('[PROFILE.JS] Clearing fields for project-entry-', visibleProjectCount);
        clearProjectEntryFields(visibleProjectCount);
        const lastProjectEl = document.getElementById(`project-entry-${visibleProjectCount}`);
        if (lastProjectEl) {
            console.log('[PROFILE.JS] Hiding project-entry-', visibleProjectCount);
            lastProjectEl.style.display = 'none';
        } else {
            console.error('[PROFILE.JS] Could not find lastProjectEl for project-entry-', visibleProjectCount);
        }
        
        visibleProjectCount--;
        console.log('[PROFILE.JS] Decremented visibleProjectCount to:', visibleProjectCount);
        updateAddProjectButtonVisibility();
        console.log('[PROFILE.JS] handleRemoveProjectClick finished. Data NOT persisted by this action.');
    }

    // --- Load Profile Data ---
    function loadProfile() {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

        if (currentUser.firstName) firstNameEl.value = currentUser.firstName;
        if (currentUser.lastName) lastNameEl.value = currentUser.lastName;
        if (currentUser.email) emailEl.value = currentUser.email;
        emailEl.disabled = true;
        if (currentUser.about) aboutEl.value = currentUser.about;
        profileImgEl.src = currentUser.profilePicture || '../pics/defaultPic.jpeg';
        navProfileImgEl.src = currentUser.profilePicture || '../pics/defaultPic.png';
        navUserNameEl.textContent = currentUser.firstName || currentUser.email || 'User';

        if (userProfile.age) ageEl.value = userProfile.age;
        if (userProfile.linkedinLink) linkedinLinkEl.value = userProfile.linkedinLink;
        weatherApiCheckbox.checked = !!userProfile.weatherApi;
        stockApiCheckbox.checked = !!userProfile.stockApi;

        // Load global competencies
        const globalCompetenciesGroup = document.getElementById('global-competencies-checkbox-group');
        if (globalCompetenciesGroup && userProfile.globalCompetencies && Array.isArray(userProfile.globalCompetencies)) {
            const globalCheckboxes = globalCompetenciesGroup.querySelectorAll('input[name="global-competencies"]');
            globalCheckboxes.forEach(checkbox => {
                if (userProfile.globalCompetencies.includes(checkbox.value)) {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            });
        } else if (globalCompetenciesGroup) {
            // If no saved global competencies, ensure all are unchecked
            const globalCheckboxes = globalCompetenciesGroup.querySelectorAll('input[name="global-competencies"]');
            globalCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }

        // Load projects
        // First, reset all project entries and hide non-default ones
        for (let i = 1; i <= MAX_PROJECTS; i++) {
            clearProjectEntryFields(i); // Clears title, desc, image URL, competencies
            const projectEntry = document.getElementById(`project-entry-${i}`);
            if (projectEntry && i > 1) { // Hide project entries 2 and 3 initially
                projectEntry.style.display = 'none';
            }
        }
        visibleProjectCount = 1; // Reset visible count

        if (userProfile.projects && Array.isArray(userProfile.projects)) {
            userProfile.projects.forEach((project, index) => {
                const projectNum = index + 1;
                if (projectNum > MAX_PROJECTS) return; // Don't load more than max

                const projectEntry = document.getElementById(`project-entry-${projectNum}`);
                if (projectEntry) {
                    projectEntry.querySelector('.project-title').value = project.title || '';
                    projectEntry.querySelector('.project-description').value = project.description || '';
                    projectEntry.querySelector('.project-image-url').value = project.image || ''; // Load image URL

                    // Load competencies
                    const competenciesGroup = projectEntry.querySelector('.competencies-checkbox-group');
                    if (competenciesGroup && project.competencies && Array.isArray(project.competencies)) {
                        // First, uncheck all competencies for this project entry
                        competenciesGroup.querySelectorAll(`input[name='competencies-${projectNum}']`).forEach(cb => cb.checked = false);
                        // Then, check the saved ones
                        project.competencies.forEach(compValue => {
                            const checkbox = competenciesGroup.querySelector(`input[name='competencies-${projectNum}'][value='${compValue}']`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }

                    if (projectNum > 1) { // If it's project 2 or 3, make it visible
                        projectEntry.style.display = 'block';
                    }
                    visibleProjectCount = projectNum; // Update visible count to the last loaded project
                }
            });
        }
        updateAddProjectButtonVisibility(); // Update button based on loaded projects
    } // End of loadProfile function

    // --- Form Submission Handler ---
    function handleSubmitProfile(event) {
        event.preventDefault(); // Prevent native form submission

        // Only proceed with alert and redirect if the main save button was the trigger.
        if (event.submitter && event.submitter.id === 'save-profile-btn') {
            console.log('[PROFILE.JS] handleSubmitProfile called by save-profile-btn.');
            persistProfileData(); 
            alert('Profile saved successfully!');
            window.location.href = 'home.html'; 
        } else {
            // If triggered by anything else (or submitter is unclear), log it and do nothing further.
            // This includes the case where remove button still somehow triggers submit.
            // No data persistence here as per user request to only save on explicit save.
            console.log('[PROFILE.JS] handleSubmitProfile called, but NOT by save-profile-btn. Submitter ID:', event.submitter ? event.submitter.id : 'undefined/unknown');
            // Do NOT persistProfileData() here.
        }
    }

    // --- Event Listeners ---
    if (updateImgBtn && imgUploadInput) {
        updateImgBtn.onclick = () => imgUploadInput.click();
        imgUploadInput.onchange = function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const newImgSrc = e.target.result;
                    profileImgEl.src = newImgSrc;
                    navProfileImgEl.src = newImgSrc; 
                    let currentUser = JSON.parse(localStorage.getItem('user')) || {};
                    currentUser.profilePicture = newImgSrc;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    let users = JSON.parse(localStorage.getItem('USERS')) || [];
                    const userIndex = users.findIndex(u => u.userId === currentUser.userId);
                    if (userIndex !== -1) {
                        users[userIndex].profilePicture = newImgSrc;
                        localStorage.setItem('USERS', JSON.stringify(users));
                    }
                    persistProfileData();
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', function () {
            console.log('[PROFILE.JS] Add Project button clicked. Current visibleProjectCount:', visibleProjectCount);
            if (visibleProjectCount < MAX_PROJECTS) {
                visibleProjectCount++;
                console.log('[PROFILE.JS] Incremented visibleProjectCount to:', visibleProjectCount);
                const nextProjectEntry = document.getElementById(`project-entry-${visibleProjectCount}`);
                if (nextProjectEntry) {
                    clearProjectEntryFields(visibleProjectCount); 
                    nextProjectEntry.style.display = 'block';
                    console.log('[PROFILE.JS] Made project-entry-', visibleProjectCount, 'visible.');
                } else {
                    console.error('[PROFILE.JS] Could not find nextProjectEntry for project-entry-', visibleProjectCount);
                }
                updateAddProjectButtonVisibility();
            } else {
                console.log('[PROFILE.JS] Max projects reached. Cannot add more.');
            }
        }); // Correctly closed addProjectBtn listener
    }

    // Event delegation for remove project buttons
    if (profileForm) {
        profileForm.addEventListener('click', function(event) {
            // Log the actual click target and its classes for debugging
            console.log('[PROFILE.JS] Form click event. Target:', event.target, 'Target classes:', event.target.classList, 'Target tagName:', event.target.tagName);

            let removeButtonElement = null;

            // Primary check: directly on event.target if it IS the button
            if (event.target.tagName === 'BUTTON' && event.target.classList.contains('remove-project-btn')) {
                removeButtonElement = event.target; // event.target is the button itself
                console.log('[PROFILE.JS] Direct Check (classList.contains) Passed: event.target is a BUTTON with .remove-project-btn.');
            } else {
                // Log why the direct check failed for context
                console.log('[PROFILE.JS] Direct Check (classList.contains) Failed. event.target.tagName:', event.target.tagName, 'Target classList value:', event.target.classList.value, 'Searching for class string:', 'remove-project-btn', 'Result of classList.contains("remove-project-btn"):', event.target.classList.contains('remove-project-btn'));
                
                // Second direct check: using event.target.matches()
                if (event.target.tagName === 'BUTTON' && event.target.matches('.remove-project-btn')) {
                    removeButtonElement = event.target;
                    console.log('[PROFILE.JS] Second Direct Check (matches) Passed: event.target is a BUTTON and matches .remove-project-btn selector.');
                } else {
                    console.log('[PROFILE.JS] Second Direct Check (matches) Failed. event.target.tagName:', event.target.tagName, 'Result of matches(.remove-project-btn):', event.target.matches('.remove-project-btn'));

                    // Fallback: Try .closest() in case the click was on a child INSIDE the button
                    const buttonViaClosest = event.target.closest('.remove-project-btn');
                    if (buttonViaClosest) {
                        removeButtonElement = buttonViaClosest;
                        console.log('[PROFILE.JS] Fallback (.closest) Succeeded: .closest() found a .remove-project-btn parent.');
                    } else {
                        console.log('[PROFILE.JS] Fallback (.closest) Failed: .closest() also did not find .remove-project-btn. No remove action taken.');
                    }
                }
            }

            if (removeButtonElement) {
                console.log('[PROFILE.JS] Valid remove button identified. Proceeding to handle remove click for button:', removeButtonElement);
                event.preventDefault(); 
                event.stopPropagation(); 
                event.stopImmediatePropagation();

                const projectNum = parseInt(removeButtonElement.dataset.projectNum, 10);
                console.log('[PROFILE.JS] Calling handleRemoveProjectClick for projectNum:', projectNum);
                handleRemoveProjectClick(projectNum);
            }
        });

        profileForm.addEventListener('submit', handleSubmitProfile);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('selectedAPIs');
            window.location.href = 'login.html';
        });
    }

    // --- Initializations ---
    loadProfile(); 
});